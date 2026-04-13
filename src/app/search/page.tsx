'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Hash, TrendingUp } from 'lucide-react';
import { searchUsers } from '@/features/feed/search-actions';
import { getDiscoverProfiles } from '@/features/feed/discover-actions';
import { getTrendingHashtags } from '@/features/feed/hashtag-actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [discover, setDiscover] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDiscoverProfiles().then(setDiscover);
    getTrendingHashtags().then(setTrendingTags);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchUsers(query);
      setResults(data);
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
        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-purple-600/30 transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-400 overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{user.full_name}</p>
          <p className="text-xs text-zinc-600">@{user.username}{user.city ? ` · ${user.city}` : ''}{user.car ? ` · ${user.car}` : ''}</p>
          {user.sports?.length > 0 && (
            <div className="flex gap-1 mt-1">
              {user.sports.slice(0, 3).map((s: string) => (
                <Badge key={s} variant="outline" className="border-zinc-800 text-zinc-600 text-[10px] px-1.5 py-0 capitalize">{s}</Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 outline-none text-sm"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && query.length >= 2 && results.length > 0 && (
          <div className="flex flex-col gap-2">{results.map(renderUser)}</div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="text-center text-sm text-zinc-600 py-8">No one found</p>
        )}

        {query.length < 2 && trendingTags.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            <h2 className="text-sm font-medium text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Trending tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/hashtag/${tag.name}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800/50 hover:border-purple-600/30 text-sm text-purple-400 transition-colors"
                >
                  <Hash className="w-3 h-3" />{tag.name}
                  <span className="text-xs text-zinc-600 ml-1">{tag.posts_count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {query.length < 2 && discover.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-400">Discover people</h2>
            <div className="flex flex-col gap-2">{discover.map(renderUser)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
