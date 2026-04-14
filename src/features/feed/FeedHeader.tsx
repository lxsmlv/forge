'use client';

import { useState, useEffect } from 'react';
import { Flame, Search } from 'lucide-react';
import Link from 'next/link';
import { getStreak } from './streak-actions';

export function FeedHeader() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getStreak().then((data) => setStreak(data.current));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); window.location.href = '/feed'; }}
          className="text-2xl tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </button>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{streak}</span>
            </div>
          )}
          <Link href="/search" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-600/50 transition-colors">
            <Search className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
