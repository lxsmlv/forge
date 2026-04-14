'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Users, Plus, Search, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/lib/useT';
import { MessagesSkeleton } from '@/features/feed/Skeletons';
import { getConversations } from '@/features/messages/actions';
import { getGroups } from '@/features/groups/actions';
import { searchUsers } from '@/features/feed/search-actions';
import { decryptMessageDual } from '@/lib/crypto';

export default function Messages() {
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');
  const [conversations, setConversations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const t = useT();

  const decryptPreviews = useCallback(async (convs: any[]) => {
    const decrypted = await Promise.all(
      convs.map(async (conv) => {
        if (conv.is_encrypted && conv.last_encrypted_key && conv.last_iv) {
          const text = await decryptMessageDual(
            conv.last_message,
            conv.last_encrypted_key,
            conv.last_encrypted_key_sender || null,
            conv.last_iv,
          );
          return { ...conv, last_message_decrypted: text };
        }
        return { ...conv, last_message_decrypted: conv.last_message };
      }),
    );
    return decrypted;
  }, []);

  useEffect(() => {
    Promise.all([getConversations(), getGroups()]).then(async ([c, g]) => {
      const decrypted = await decryptPreviews(c);
      setConversations(decrypted);
      setGroups(g);
      setLoading(false);
    });
  }, [decryptPreviews]);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      const users = await searchUsers(searchQuery);
      setSearchResults(users);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header with FORGE */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => { window.location.href = '/feed'; }}
            className="text-2xl tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </button>
          <div className="flex items-center gap-2">
            {activeTab === 'groups' && (
              <Link href="/groups" className="text-purple-400 hover:text-purple-300">
                <Plus className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50 mb-3">
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

        {/* Search for new chat */}
        {activeTab === 'chats' && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder={t('messages.search_people')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 outline-none"
            />
          </div>
        )}
      </div>

      <main className="max-w-lg mx-auto px-4">
        {/* Search results */}
        {searchQuery.length >= 2 && activeTab === 'chats' && (
          <div className="mb-4">
            {searching ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-zinc-600 mb-1">{t('search.people')}</p>
                {searchResults.map((user) => {
                  const initials = user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <Link
                      key={user.username}
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-950/50 hover:bg-zinc-900 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-400 overflow-hidden">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                      </div>
                      <div>
                        <p className="text-sm text-white">{user.full_name}</p>
                        <p className="text-xs text-zinc-600">@{user.username}</p>
                      </div>
                      <PenSquare className="w-4 h-4 text-zinc-700 ml-auto" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-xs text-zinc-600 py-4">{t('search.no_people')}</p>
            )}
          </div>
        )}

        {/* Main content */}
        {loading ? (
          <MessagesSkeleton />
        ) : activeTab === 'chats' ? (
          conversations.length === 0 && searchQuery.length < 2 ? (
            <div className="flex flex-col items-center py-16 text-zinc-600">
              <MessageCircle className="w-8 h-8 mb-2 text-zinc-700" />
              <p className="text-sm">{t('messages.none')}</p>
              <p className="text-xs text-zinc-700 mt-1">Use search above to find people</p>
            </div>
          ) : searchQuery.length < 2 ? (
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
                      {conv.avatar_url ? <img src={conv.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">@{conv.username}</p>
                        <span className="text-xs text-zinc-600">{conv.last_time}</span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">
                        {conv.last_message_decrypted || '🔒'}
                      </p>
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
          ) : null
        ) : (
          groups.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-zinc-600">
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
