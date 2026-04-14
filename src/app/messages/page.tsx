'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/lib/useT';
import { MessagesSkeleton } from '@/features/feed/Skeletons';
import { getConversations } from '@/features/messages/actions';
import { getGroups } from '@/features/groups/actions';

export default function Messages() {
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');
  const [conversations, setConversations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    Promise.all([getConversations(), getGroups()]).then(([c, g]) => {
      setConversations(c);
      setGroups(g);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <h1
            className="text-xl tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('messages.title')}
          </h1>
          {activeTab === 'groups' && (
            <Link href="/groups" className="text-purple-400 hover:text-purple-300">
              <Plus className="w-5 h-5" />
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50 mb-4">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'chats'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {t('messages.chats')}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'groups'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            {t('groups.title')}
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4">
        {loading ? (
          <MessagesSkeleton />
        ) : activeTab === 'chats' ? (
          conversations.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-600">
              <MessageCircle className="w-8 h-8 mb-2 text-zinc-700" />
              <p className="text-sm">{t('messages.none')}</p>
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
          )
        ) : (
          groups.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-600">
              <Users className="w-8 h-8 mb-2 text-zinc-700" />
              <p className="text-sm">{t('groups.none')}</p>
              <Link href="/groups" className="text-xs text-purple-400 mt-2">{t('groups.create')}</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-purple-600/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-600/30 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{group.name}</p>
                    {group.description && <p className="text-xs text-zinc-600 truncate">{group.description}</p>}
                    <p className="text-xs text-zinc-700">{group.members_count} {t('groups.members')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
