'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Shield } from 'lucide-react';
import { getMessages, sendEncryptedMessage } from '@/features/messages/actions';
import { decryptMessageDual, encryptMessageDual, getStoredPrivateKey, generateKeyPair, savePrivateKey, encryptPrivateKeyWithPassword, decryptPrivateKeyWithPassword } from '@/lib/crypto';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

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

  const loadMessages = useCallback(async () => {
    const data = await getMessages(otherUserId);
    setMessages(data);
    setLoading(false);
  }, [otherUserId]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('username, full_name, avatar_url, public_key')
      .eq('id', otherUserId)
      .single()
      .then(({ data }) => setOtherUser(data));

    loadMessages();

    // Regenerate keys if missing
    if (!getStoredPrivateKey()) {
      (async () => {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const keyPair = await generateKeyPair();
          savePrivateKey(keyPair.privateKey);
          await sb.from('profiles').update({ public_key: keyPair.publicKey }).eq('id', user.id);
        }
      })();
    }

    // Realtime subscription for new messages
    const channel = supabase
      .channel(`chat-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as any;
          // Only react to messages in this conversation
          if (
            (msg.sender_id === otherUserId) ||
            (msg.receiver_id === otherUserId)
          ) {
            loadMessages();
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [otherUserId, loadMessages]);

  useEffect(() => {
    async function decrypt() {
      const results = await Promise.all(
        messages.map(async (msg) => {
          if (msg.encrypted_key && msg.iv) {
            const decrypted = await decryptMessageDual(msg.text, msg.encrypted_key, msg.encrypted_key_sender || null, msg.iv);
            return { ...msg, text: decrypted };
          }
          return msg;
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
      { id: Date.now().toString(), text: currentText, is_mine: true, time: 'now', encrypted: true },
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
    <div className="h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] flex flex-col">
      <header className="forge-header shrink-0 z-50">
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

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto">
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
                        ? 'bg-gradient-to-br from-[var(--forge-purple)] to-[var(--forge-purple-dim)] text-white rounded-br-[6px] shadow-[0_2px_12px_rgba(139,92,246,0.25)]'
                        : 'bg-[var(--forge-card)] border border-[var(--forge-border)] text-[var(--forge-text-primary)] rounded-bl-[6px]'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.is_mine ? 'text-purple-200/80' : 'text-[var(--forge-text-tertiary)]'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input bar — above bottom nav, not behind it */}
      <div className="shrink-0 bg-[var(--forge-black)] border-t border-[var(--forge-border)] pb-[env(safe-area-inset-bottom)] mb-16">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex gap-2">
          <Input
            placeholder={hasE2E ? '🔒 Encrypted message...' : 'Message...'}
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
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
