'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useT } from '@/lib/useT';
import { getConversations } from '@/features/messages/actions';

export default function Messages() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    getConversations().then((data) => {
      setConversations(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">{t('messages.title')}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-zinc-600">
            <p className="text-sm">{t('messages.none')}</p>
            <p className="text-xs text-zinc-700 mt-1">Visit someone's profile to start a conversation</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((conv) => {
              const initials = conv.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <Link
                  key={conv.user_id}
                  href={`/messages/${conv.user_id}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-purple-600/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-400 overflow-hidden shrink-0">
                    {conv.avatar_url ? (
                      <img src={conv.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">@{conv.username}</p>
                      <span className="text-xs text-zinc-600">{conv.last_time}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
