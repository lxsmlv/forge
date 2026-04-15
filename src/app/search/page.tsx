'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Hash, TrendingUp, Users, FileText } from 'lucide-react';
import { searchUsers, searchPosts } from '@/features/feed/search-actions';
import { getDiscoverProfiles } from '@/features/feed/discover-actions';
import { getTrendingHashtags } from '@/features/feed/hashtag-actions';
import { PostCard } from '@/features/feed/PostCard';
import { useT } from '@/lib/useT';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'people' | 'posts'>('people');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [discover, setDiscover] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useT();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getDiscoverProfiles().then(setDiscover);
    getTrendingHashtags().then(setTrendingTags);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const [users, posts] = await Promise.all([searchUsers(query), searchPosts(query)]);
      setUserResults(users);
      setPostResults(posts);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  const renderUser = (user: any) => {
    const initials = user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <Link
        key={user.username || user.id}
        href={`/profile/${user.username}`}
        className="forge-card forge-card-interactive flex items-center gap-3 px-3 py-3"
      >
        <div className="forge-avatar h-10 w-10 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-sm font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
          {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--forge-text-primary)] truncate">{user.full_name}</p>
          <p className="text-xs text-[var(--forge-text-tertiary)] truncate">@{user.username}{user.city ? ` · ${user.city}` : ''}{user.car ? ` · ${user.car}` : ''}</p>
          {user.sports?.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {user.sports.slice(0, 3).map((s: string) => (
                <span key={s} className="forge-badge capitalize" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  };

  const hasResults = query.length >= 2;

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--forge-text-tertiary)] pointer-events-none z-10" />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="forge-input w-full !pl-10"
          />
        </div>

        {hasResults && (
          <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)] mb-4">
            <button
              onClick={() => setSearchTab('people')}
              className={`forge-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
                searchTab === 'people' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]' : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5" />{t('search.people')} ({userResults.length})
            </button>
            <button
              onClick={() => setSearchTab('posts')}
              className={`forge-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
                searchTab === 'posts' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]' : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />{t('search.posts_tab')} ({postResults.length})
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && hasResults && searchTab === 'people' && (
          userResults.length > 0
            ? <div className="flex flex-col gap-2">{userResults.map(renderUser)}</div>
            : <p className="text-center text-sm text-[var(--forge-text-tertiary)] py-8">{t('search.no_people')}</p>
        )}

        {!loading && hasResults && searchTab === 'posts' && (
          postResults.length > 0
            ? <div className="flex flex-col gap-4">{postResults.map((p) => <PostCard key={p.id} post={p} />)}</div>
            : <p className="text-center text-sm text-[var(--forge-text-tertiary)] py-8">{t('search.no_posts')}</p>
        )}

        {!hasResults && trendingTags.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            <h2 className="text-[11px] font-semibold text-[var(--forge-text-secondary)] flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-[var(--forge-purple-bright)]" /> Trending tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <Link key={tag.name} href={`/hashtag/${tag.name}`} className="forge-badge forge-badge-purple forge-badge-interactive">
                  <Hash className="w-3 h-3" />{tag.name}
                  <span className="text-[10px] text-[var(--forge-text-tertiary)] ml-1 tabular-nums">{tag.posts_count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!hasResults && discover.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[11px] font-semibold text-[var(--forge-text-secondary)] uppercase tracking-wider">{t('search.discover')}</h2>
            <div className="flex flex-col gap-2">{discover.map(renderUser)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
