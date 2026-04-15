'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { getStreak } from './streak-actions';
import { getUnreadCount } from '@/features/notifications/actions';
import { useAblyEvent } from '@/lib/ably/client-provider';

export function FeedHeader() {
  const [streak, setStreak] = useState(0);
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    const count = await getUnreadCount();
    setUnread(count);
  }, []);

  useEffect(() => {
    getStreak().then((data) => setStreak(data.current));
    refreshUnread();
  }, [refreshUnread]);

  useAblyEvent('notification:new', refreshUnread);

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
          <Link href="/notifications" className="forge-press relative h-9 w-9 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center hover:border-[var(--forge-border-hover)] transition-all">
            <Bell className="w-4 h-4 text-[var(--forge-text-secondary)]" strokeWidth={2} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <Link href="/search" className="forge-press h-9 w-9 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center hover:border-[var(--forge-border-hover)] transition-all">
            <Search className="w-4 h-4 text-[var(--forge-text-secondary)]" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
