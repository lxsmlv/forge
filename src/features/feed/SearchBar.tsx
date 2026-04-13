'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchUsers } from './search-actions';
import Link from 'next/link';

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  if (!open) {
    return (
      <button onClick={handleOpen} className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-600/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-400" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95" onClick={handleClose}>
      <div className="max-w-lg mx-auto px-4 pt-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/30 outline-none text-sm"
            />
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-2">
            {results.map((user) => {
              const initials = user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <Link
                  key={user.username}
                  href={`/profile/${user.username}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-purple-600/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-400 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{user.full_name}</p>
                    <p className="text-xs text-zinc-600">@{user.username}{user.city ? ` · ${user.city}` : ''}{user.car ? ` · ${user.car}` : ''}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="text-center text-sm text-zinc-600 py-8">No one found</p>
        )}
      </div>
    </div>
  );
}
