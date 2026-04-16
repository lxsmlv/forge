'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Shield } from 'lucide-react';
import { getMessages, sendEncryptedMessage } from '@/features/messages/actions';
import { decryptMessageDual, encryptMessageDual, getStoredPrivateKey } from '@/lib/crypto';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAbly } from '@/lib/ably/client-provider';
import { useT } from '@/lib/useT';

export default function Chat() {
  const params = useParams();
  const router = useRouter();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const { client: ablyClient, userId: ablyUserId } = useAbly();
  const t = useT();

  const loadMessages = useCallback(async () => {
    const data = await getMessages(otherUserId);
    setMessages(data);
    setLoading(false);
  }, [otherUserId]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserIdRef.current = user?.id || null;
    });

    supabase
      .from('profiles')
      .select('username, full_name, avatar_url, public_key')
      .eq('id', otherUserId)
      .single()
      .then(({ data }) => setOtherUser(data));

    loadMessages();
  }, [otherUserId, loadMessages]);

  // Ably subscription — append new messages from realtime broker
  useEffect(() => {
    if (!ablyClient || !ablyUserId) return;
    currentUserIdRef.current = ablyUserId;

    const channel = ablyClient.channels.get(`user:${ablyUserId}`);
    const supabase = createClient();

    const handler = (msg: { data?: any }) => {
      const payload = msg.data;
      if (!payload) return;
      if (payload.sender_id !== otherUserId && payload.receiver_id !== otherUserId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [
          ...prev,
          {
            id: payload.id,
            text: payload.text,
            encrypted_key: payload.encrypted_key,
            encrypted_key_sender: payload.encrypted_key_sender,
            iv: payload.iv,
            sender_id: payload.sender_id,
            is_mine: payload.sender_id === ablyUserId,
            time: new Date(payload.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          },
        ];
      });

      if (payload.receiver_id === ablyUserId) {
        supabase.from('messages').update({ is_read: true }).eq('id', payload.id).then(() => {});
      }
    };

    channel.subscribe('message:new', handler);
    channel.subscribe('message:echo', handler);

    // On reconnect, fetch any missed messages from server
    const connectionListener = (stateChange: { current: string }) => {
      if (stateChange.current === 'connected') {
        loadMessages();
      }
    };
    ablyClient.connection.on(connectionListener);

    return () => {
      channel.unsubscribe('message:new', handler);
      channel.unsubscribe('message:echo', handler);
      ablyClient.connection.off(connectionListener);
    };
  }, [ablyClient, ablyUserId, otherUserId, loadMessages]);

  // Auto-focus input on desktop when typing starts (skip mobile to avoid keyboard popup)
  useEffect(() => {
    if (typeof window === 'undefined' || 'ontouchstart' in window) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    async function decrypt() {
      const userId = currentUserIdRef.current;
      const results = await Promise.all(
        messages.map(async (msg) => {
          const is_mine = userId ? msg.sender_id === userId : (msg.is_mine ?? false);
          const time = msg.time || (msg.raw_created_at
            ? new Date(msg.raw_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            : msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : '');
          if (msg.encrypted_key && msg.iv) {
            const decrypted = await decryptMessageDual(msg.text, msg.encrypted_key, msg.encrypted_key_sender || null, msg.iv);
            return { ...msg, text: decrypted, is_mine, time };
          }
          return { ...msg, is_mine, time };
        }),
      );
      setDecryptedMessages(results);
    }
    decrypt();
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [decryptedMessages]);

  const handleSend = () => {
    if (!text.trim() || !otherUser) return;
    const currentText = text;
    setText('');

    setDecryptedMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: currentText,
        is_mine: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        encrypted: true,
      },
    ]);

    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: myProfile } = user ? await supabase.from('profiles').select('public_key').eq('id', user.id).single() : { data: null };

      if (otherUser.public_key && myProfile?.public_key) {
        const encrypted = await encryptMessageDual(currentText, otherUser.public_key, myProfile.public_key);
        await sendEncryptedMessage(otherUserId, encrypted.encryptedText, encrypted.encryptedKeyReceiver, encrypted.iv, encrypted.encryptedKeySender);
      } else if (otherUser.public_key) {
        const { encryptMessage } = await import('@/lib/crypto');
        const encrypted = await encryptMessage(currentText, otherUser.public_key);
        await sendEncryptedMessage(otherUserId, encrypted.encryptedText, encrypted.encryptedKey, encrypted.iv);
      } else {
        await sendEncryptedMessage(otherUserId, currentText, '', '');
      }
    });
  };

  const initials = otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const hasE2E = !!otherUser?.public_key && !!getStoredPrivateKey();

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header fixed top-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {otherUser && (
            <>
              <div className="forge-avatar h-9 w-9 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-xs font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                {otherUser.avatar_url ? (
                  <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-[var(--forge-text-primary)] truncate block">@{otherUser.username}</span>
                {hasE2E && (
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[var(--forge-success)]" />
                    <span className="text-[10px] text-[var(--forge-success)]">end-to-end encrypted</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* pt-20 clears fixed header + safe-area-top, pb-36 clears fixed input + BottomNav + safe area.
          min-h trick + flex justify-end → messages cluster at BOTTOM (chat-style), not top. */}
      <main className="px-4 pt-20 pb-36" style={{ minHeight: 'calc(100dvh - 5rem - 9rem)' }}>
        <div className="max-w-lg mx-auto flex flex-col justify-end" style={{ minHeight: '100%' }}>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-6 w-6 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : decryptedMessages.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--forge-success)]/10 flex items-center justify-center mb-3">
                <Shield className="w-7 h-7 text-[var(--forge-success)]" />
              </div>
              <p className="text-sm text-[var(--forge-text-primary)] font-semibold">Messages are end-to-end encrypted</p>
              <p className="text-xs text-[var(--forge-text-tertiary)] mt-1">Only you and @{otherUser?.username} can read them</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {decryptedMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-[18px] text-[14px] leading-snug ${
                      msg.is_mine
                        ? 'rounded-br-[6px] shadow-[0_2px_12px_rgba(139,92,246,0.28)]'
                        : 'bg-[var(--forge-card)] border border-[var(--forge-border)] text-[var(--forge-text-primary)] rounded-bl-[6px]'
                    }`}
                    style={msg.is_mine ? { color: '#ffffff', background: 'var(--forge-gradient-chat)' } : undefined}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${msg.is_mine ? '' : 'text-[var(--forge-text-tertiary)]'}`}
                      style={msg.is_mine ? { color: 'rgba(255,255,255,0.75)' } : undefined}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input bar — fixed directly above BottomNav (nav height ~46px in browser, +safe-area in PWA) */}
      <div className="fixed left-0 right-0 z-40 bg-[var(--forge-black)] border-t border-[var(--forge-border)]" style={{ bottom: '46px' }}>
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder={t('messages.type_message')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="forge-input flex-1 !py-2"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isPending}
            className="forge-press h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-gradient)] shadow-[var(--forge-shadow-glow)] flex items-center justify-center transition-all disabled:opacity-30 disabled:shadow-none hover:shadow-[var(--forge-shadow-glow-strong)]"
            style={{ background: 'var(--forge-gradient)' }}
          >
            <Send className="w-4 h-4" style={{ color: '#ffffff' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
