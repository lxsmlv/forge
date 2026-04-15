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
    <header className="forge-header sticky top-0 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); window.location.href = '/feed'; }}
          className="text-[22px] tracking-[0.18em] font-medium forge-text-glow"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </button>
        <div className="flex items-center gap-2.5">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/8 border border-orange-500/15">
              <Flame className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
              <span className="text-xs font-semibold text-orange-400 tabular-nums">{streak}</span>
            </div>
          )}
          <Link href="/search" className="forge-press h-9 w-9 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center hover:border-[var(--forge-border-hover)] transition-all">
            <Search className="w-4 h-4 text-[var(--forge-text-secondary)]" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
