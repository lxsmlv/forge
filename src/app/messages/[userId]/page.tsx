'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { getMessages, sendMessage } from '@/features/messages/actions';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function Chat() {
  const params = useParams();
  const router = useRouter();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', otherUserId)
      .single()
      .then(({ data }) => setOtherUser(data));

    getMessages(otherUserId).then((data) => {
      setMessages(data);
      setLoading(false);
    });
  }, [otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    const currentText = text;
    setText('');

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: currentText, is_mine: true, time: 'now' },
    ]);

    startTransition(async () => {
      await sendMessage(otherUserId, currentText);
    });
  };

  const initials = otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
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
              <span className="text-sm font-medium text-white">@{otherUser.username}</span>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-zinc-600">
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
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
      </main>

      <div className="sticky bottom-0 bg-black/80 backdrop-blur-md border-t border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex gap-2">
          <Input
            placeholder="Message..."
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
