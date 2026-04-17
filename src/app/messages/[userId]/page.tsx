'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Shield, Trash2, ImagePlus, X } from 'lucide-react';
import Link from 'next/link';
import { deleteChat } from '@/features/messages/actions';
import { getMessages, sendEncryptedMessage, uploadEncryptedMedia } from '@/features/messages/actions';
import { decryptMessageDual, encryptMessageDual, encryptMedia, decryptMedia, getStoredPrivateKey } from '@/lib/crypto';
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
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [sendingMedia, setSendingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [decryptedMediaCache, setDecryptedMediaCache] = useState<Record<string, string>>({});

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
            media_url: payload.media_url,
            media_type: payload.media_type,
            media_key: payload.media_key,
            media_key_sender: payload.media_key_sender,
            media_iv: payload.media_iv,
          },
        ];
      });

      if (payload.receiver_id === ablyUserId) {
        // Mark as delivered + read (user has chat open)
        supabase.from('messages').update({ is_read: true, delivered_at: new Date().toISOString() }).eq('id', payload.id).then(() => {});
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
            return { ...msg, text: decrypted, is_mine, time, is_read: msg.is_read ?? false, delivered_at: msg.delivered_at ?? null };
          }
          return { ...msg, is_mine, time, is_read: msg.is_read ?? false, delivered_at: msg.delivered_at ?? null, _localMediaPreview: msg._localMediaPreview };
        }),
      );
      setDecryptedMessages(results);
    }
    decrypt();
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [decryptedMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else {
      setMediaPreview(null);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((!text.trim() && !mediaFile) || !otherUser) return;
    const currentText = text;
    const currentFile = mediaFile;
    setText('');
    clearMedia();

    setDecryptedMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: currentText || (currentFile ? '📎 Sending...' : ''),
        is_mine: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        encrypted: true,
        _localMediaPreview: currentFile?.type.startsWith('image/') ? URL.createObjectURL(currentFile) : undefined,
      },
    ]);

    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: myProfile } = user ? await supabase.from('profiles').select('public_key').eq('id', user.id).single() : { data: null };

      let mediaPayload: { url: string; type: string; mediaKey: string; mediaKeySender: string; mediaIv: string } | undefined;

      // Encrypt and upload media if present
      if (currentFile && otherUser.public_key && myProfile?.public_key) {
        setSendingMedia(true);
        const fileBuffer = await currentFile.arrayBuffer();
        const encMedia = await encryptMedia(fileBuffer, otherUser.public_key, myProfile.public_key);

        const fd = new FormData();
        const mediaBlob = new Blob([new Uint8Array(encMedia.encryptedBlob) as any], { type: 'application/octet-stream' });
        fd.append('file', mediaBlob, 'media.enc');
        const uploadedUrl = await uploadEncryptedMedia(fd);

        if (uploadedUrl) {
          mediaPayload = {
            url: uploadedUrl,
            type: currentFile.type,
            mediaKey: encMedia.encryptedKeyReceiver,
            mediaKeySender: encMedia.encryptedKeySender,
            mediaIv: encMedia.iv,
          };
        }
        setSendingMedia(false);
      }

      if (otherUser.public_key && myProfile?.public_key) {
        const textToEncrypt = currentText || (mediaPayload ? '📎' : '');
        const encrypted = await encryptMessageDual(textToEncrypt, otherUser.public_key, myProfile.public_key);
        await sendEncryptedMessage(otherUserId, encrypted.encryptedText, encrypted.encryptedKeyReceiver, encrypted.iv, encrypted.encryptedKeySender, mediaPayload);
      } else if (otherUser.public_key) {
        const { encryptMessage } = await import('@/lib/crypto');
        const encrypted = await encryptMessage(currentText || '📎', otherUser.public_key);
        await sendEncryptedMessage(otherUserId, encrypted.encryptedText, encrypted.encryptedKey, encrypted.iv);
      } else {
        await sendEncryptedMessage(otherUserId, currentText || '📎', '', '');
      }
    });
  };

  const initials = otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const hasE2E = !!otherUser?.public_key && !!getStoredPrivateKey();

  return (
    <div
      className="flex flex-col bg-[var(--forge-black)] text-[var(--forge-text-primary)]"
      style={{ height: 'calc(100dvh - var(--forge-nav-height))' }}
    >
      {/* Header — flex shrink-0, no fixed positioning needed */}
      <header className="forge-header shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-2.5">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {otherUser && (
            <>
              <Link href={`/profile/${otherUser.username}`} className="forge-avatar forge-press h-9 w-9 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-xs font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                {otherUser.avatar_url ? (
                  <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </Link>
              <Link href={`/profile/${otherUser.username}`} className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-[var(--forge-text-primary)] truncate block">@{otherUser.username}</span>
                {hasE2E && (
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[var(--forge-success)]" />
                    <span className="text-[10px] text-[var(--forge-success)]">end-to-end encrypted</span>
                  </div>
                )}
              </Link>
              <div className="relative ml-auto shrink-0">
                <button onClick={() => setShowDeleteMenu(!showDeleteMenu)} className="forge-press h-8 w-8 rounded-full flex items-center justify-center text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] hover:bg-[var(--forge-card-hover)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                {showDeleteMenu && (
                  <div className="forge-glass absolute right-0 top-10 rounded-[var(--forge-radius-md)] shadow-[var(--forge-shadow-lg)] z-10 py-1 min-w-[180px] overflow-hidden">
                    <button
                      onClick={async () => {
                        setShowDeleteMenu(false);
                        if (confirm(t('chat.delete_confirm_me'))) {
                          await deleteChat(otherUserId, false);
                          router.push('/messages');
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--forge-text-secondary)] hover:bg-[var(--forge-card-hover)] transition-colors"
                    >
                      {t('chat.delete_me')}
                    </button>
                    <button
                      onClick={async () => {
                        setShowDeleteMenu(false);
                        if (confirm(t('chat.delete_confirm_both'))) {
                          await deleteChat(otherUserId, true);
                          router.push('/messages');
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--forge-error)] hover:bg-[var(--forge-card-hover)] transition-colors"
                    >
                      {t('chat.delete_both')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages — flex-1, scrollable, messages cluster at bottom via justify-end */}
      <main className="flex-1 overflow-y-auto px-4 py-3">
        <div className="max-w-lg mx-auto flex flex-col justify-end min-h-full">
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
                    {/* Encrypted media */}
                    {(msg.media_url || msg._localMediaPreview) && (
                      <EncryptedImage
                        mediaUrl={msg.media_url}
                        mediaType={msg.media_type}
                        mediaKey={msg.media_key}
                        mediaKeySender={msg.media_key_sender}
                        mediaIv={msg.media_iv}
                        localPreview={msg._localMediaPreview}
                        cache={decryptedMediaCache}
                        onDecrypted={(url) => setDecryptedMediaCache((prev) => ({ ...prev, [msg.id]: url }))}
                        msgId={msg.id}
                      />
                    )}
                    {msg.text && msg.text !== '📎' && <p>{msg.text}</p>}
                    <p
                      className={`text-[10px] mt-1 flex items-center gap-1 ${msg.is_mine ? '' : 'text-[var(--forge-text-tertiary)]'}`}
                      style={msg.is_mine ? { color: 'rgba(255,255,255,0.75)' } : undefined}
                    >
                      {msg.time}
                      {msg.is_mine && (
                        <span className={msg.is_read ? 'text-[var(--forge-purple-bright)]' : ''}>
                          {msg.is_read ? '✓✓' : msg.delivered_at ? '✓✓' : '✓'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input bar */}
      <div className="shrink-0 bg-[var(--forge-black)] border-t border-[var(--forge-border)]">
        {/* Media preview */}
        {mediaPreview && (
          <div className="max-w-lg mx-auto px-4 pt-2">
            <div className="relative inline-block">
              <img src={mediaPreview} alt="" className="h-16 rounded-[var(--forge-radius-md)] border border-[var(--forge-border)]" />
              <button onClick={clearMedia} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[var(--forge-error)] flex items-center justify-center forge-press">
                <X className="w-3 h-3" style={{ color: '#fff' }} />
              </button>
            </div>
          </div>
        )}
        {mediaFile && !mediaPreview && (
          <div className="max-w-lg mx-auto px-4 pt-2">
            <div className="relative inline-flex items-center gap-2 forge-badge">
              <span className="text-[11px] truncate max-w-[150px]">{mediaFile.name}</span>
              <button onClick={clearMedia} className="text-[var(--forge-error)] forge-press"><X className="w-3 h-3" /></button>
            </div>
          </div>
        )}
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="forge-press h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center shrink-0 hover:border-[var(--forge-border-hover)] transition-colors"
          >
            <ImagePlus className="w-4 h-4 text-[var(--forge-text-tertiary)]" />
          </button>
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
            disabled={(!text.trim() && !mediaFile) || isPending || sendingMedia}
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

function EncryptedImage({
  mediaUrl, mediaType, mediaKey, mediaKeySender, mediaIv, localPreview, cache, onDecrypted, msgId,
}: {
  mediaUrl?: string; mediaType?: string; mediaKey?: string; mediaKeySender?: string; mediaIv?: string;
  localPreview?: string; cache: Record<string, string>; onDecrypted: (url: string) => void; msgId: string;
}) {
  const [src, setSrc] = useState<string | null>(cache[msgId] || localPreview || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (src || !mediaUrl || !mediaKey || !mediaIv) return;
    let cancelled = false;

    async function decrypt() {
      setLoading(true);
      try {
        const response = await fetch(mediaUrl!);
        const encryptedData = await response.arrayBuffer();
        const decrypted = await decryptMedia(encryptedData, mediaKey!, mediaKeySender || null, mediaIv!);
        if (decrypted && !cancelled) {
          const blob = new Blob([decrypted], { type: mediaType || 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          setSrc(url);
          onDecrypted(url);
        }
      } catch {
        // Decryption failed
      }
      if (!cancelled) setLoading(false);
    }
    decrypt();
    return () => { cancelled = true; };
  }, [mediaUrl, mediaKey, mediaKeySender, mediaIv, mediaType, src, onDecrypted, msgId]);

  if (loading) {
    return (
      <div className="w-48 h-32 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] flex items-center justify-center mb-1">
        <div className="h-4 w-4 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      className="max-w-full max-h-[200px] rounded-[var(--forge-radius-md)] mb-1 cursor-pointer"
      onClick={() => window.open(src, '_blank')}
    />
  );
}
