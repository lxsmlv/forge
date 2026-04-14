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
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const keyPair = await generateKeyPair();
          savePrivateKey(keyPair.privateKey);
          await supabase.from('profiles').update({ public_key: keyPair.publicKey }).eq('id', user.id);
        }
      })();
    }

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
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
    <div className="h-screen bg-black text-white flex flex-col">
      <header className="shrink-0 bg-black/80 backdrop-blur-md border-b border-zinc-800/50 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {otherUser && (
            <>
              <div className="h-8 w-8 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-400 overflow-hidden">
                {otherUser.avatar_url ? (
                  <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white">@{otherUser.username}</span>
                {hasE2E && (
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-green-400">end-to-end encrypted</span>
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
              <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : decryptedMessages.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-600">
              <Shield className="w-8 h-8 mb-2 text-green-400/50" />
              <p className="text-sm">Messages are end-to-end encrypted</p>
              <p className="text-xs text-zinc-700 mt-1">Only you and @{otherUser?.username} can read them</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {decryptedMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.is_mine
                        ? 'bg-purple-600 text-white rounded-br-md'
                        : 'bg-zinc-900 text-zinc-200 rounded-bl-md'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.is_mine ? 'text-purple-300' : 'text-zinc-600'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input bar — above bottom nav, not behind it */}
      <div className="shrink-0 bg-black border-t border-zinc-800/50 pb-[env(safe-area-inset-bottom)] mb-16">
        <div className="max-w-lg mx-auto px-4 py-2 flex gap-2">
          <Input
            placeholder={hasE2E ? '🔒 Encrypted message...' : 'Message...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isPending}
            className="h-9 w-9 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-all disabled:opacity-30"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
