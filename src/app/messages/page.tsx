'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRealtime } from '@/lib/useRealtime';
import { MessageCircle, Users, Plus, Search, User } from 'lucide-react';
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

  const refreshConversations = useCallback(async () => {
    const c = await getConversations();
    const decrypted = await decryptPreviews(c);
    setConversations(decrypted);
  }, [decryptPreviews]);

  useEffect(() => {
    Promise.all([getConversations(), getGroups()]).then(async ([c, g]) => {
      const decrypted = await decryptPreviews(c);
      setConversations(decrypted);
      setGroups(g);
      setLoading(false);
    });
  }, [decryptPreviews]);

  // Realtime — new messages refresh conversation list
  useRealtime('messages', 'INSERT', refreshConversations);

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
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      {/* Header with FORGE */}
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => { window.location.href = '/feed'; }}
            className="text-2xl tracking-[0.15em] drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </button>
          <div className="flex items-center gap-2">
            {activeTab === 'groups' && (
              <Link href="/groups" className="forge-press text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)]">
                <Plus className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)] mb-3">
          <button
            onClick={() => setActiveTab('chats')}
            className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'chats'
                ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
                : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {t('messages.chats')}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'groups'
                ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
                : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            {t('groups.title')}
          </button>
        </div>

        {/* Search for new chat */}
        {activeTab === 'chats' && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--forge-text-tertiary)] pointer-events-none z-10" />
            <input
              type="text"
              placeholder={t('messages.search_people')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="forge-input w-full !pl-10 !py-2"
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
                <div className="h-5 w-5 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-1">{t('search.people')}</p>
                {searchResults.map((u) => {
                  const initials = u.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div key={u.username} className="flex items-center gap-3 px-3 py-2 rounded-[var(--forge-radius-md)] hover:bg-[var(--forge-card)] transition-colors">
                      <Link href={`/messages/${u.id || u.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="forge-avatar h-8 w-8 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-xs font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                          {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-[var(--forge-text-primary)] truncate">{u.full_name}</p>
                          <p className="text-xs text-[var(--forge-text-tertiary)] truncate">@{u.username}</p>
                        </div>
                      </Link>
                      <Link href={`/profile/${u.username}`} className="forge-press shrink-0 h-8 w-8 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center hover:border-[rgba(139,92,246,0.4)] transition-colors">
                        <User className="w-3.5 h-3.5 text-[var(--forge-text-tertiary)]" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-xs text-[var(--forge-text-tertiary)] py-4">{t('search.no_people')}</p>
            )}
          </div>
        )}

        {/* Main content */}
        {loading ? (
          <MessagesSkeleton />
        ) : activeTab === 'chats' ? (
          conversations.length === 0 && searchQuery.length < 2 ? (
            <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center mb-3">
                <MessageCircle className="w-7 h-7 text-[var(--forge-purple-bright)]" />
              </div>
              <p className="text-sm text-[var(--forge-text-primary)] font-semibold">{t('messages.none')}</p>
              <p className="text-xs text-[var(--forge-text-tertiary)] mt-1">Use search above to find people</p>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="flex flex-col gap-2">
              {conversations.map((conv) => {
                const initials = conv.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <Link
                    key={conv.user_id}
                    href={`/messages/${conv.user_id}`}
                    className="forge-card forge-card-interactive flex items-center gap-3 px-3 py-3"
                  >
                    <div className="forge-avatar h-10 w-10 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-sm font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                      {conv.avatar_url ? <img src={conv.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--forge-text-primary)] truncate">@{conv.username}</p>
                        <span className="text-[11px] text-[var(--forge-text-tertiary)] shrink-0 ml-2">{conv.last_time}</span>
                      </div>
                      <p className="text-xs text-[var(--forge-text-secondary)] truncate">
                        {conv.last_message_decrypted || '🔒'}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="h-5 min-w-5 px-1.5 rounded-full bg-[var(--forge-purple)] text-[10px] font-bold text-white flex items-center justify-center shrink-0 shadow-[var(--forge-shadow-glow)]">
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
            <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-[var(--forge-purple-bright)]" />
              </div>
              <p className="text-sm text-[var(--forge-text-primary)] font-semibold">{t('groups.none')}</p>
              <Link href="/groups" className="text-xs text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] mt-2 transition-colors">{t('groups.create')}</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="forge-card forge-card-interactive flex items-center gap-3 px-3 py-3"
                >
                  <div className="h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[var(--forge-purple-bright)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--forge-text-primary)]">{group.name}</p>
                    {group.description && <p className="text-xs text-[var(--forge-text-tertiary)] truncate">{group.description}</p>}
                    <p className="text-[11px] text-[var(--forge-text-muted)]">{group.members_count} {t('groups.members')}</p>
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
