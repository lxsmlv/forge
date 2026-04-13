'use client';

import { useState, useEffect } from 'react';
import { User, Bell, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SearchBar } from './SearchBar';
import { getUnreadCount } from '@/features/notifications/actions';

export function FeedHeader() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        });
    });
    getUnreadCount().then(setUnread);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <h1
          className="text-2xl tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>
        <div className="flex items-center gap-2">
          <SearchBar />
          <Link href="/messages" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-600/50 transition-colors">
            <MessageCircle className="w-4 h-4 text-zinc-400" />
          </Link>
          <Link href="/notifications" className="relative h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-600/50 transition-colors">
            <Bell className="w-4 h-4 text-zinc-400" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <Link href="/profile" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-600/50 transition-colors overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-zinc-400" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
