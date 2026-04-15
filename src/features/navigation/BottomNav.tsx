'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageCircle, Plus, Play, User } from 'lucide-react';
import { useT } from '@/lib/useT';
import { useRealtime } from '@/lib/useRealtime';
import { getUnreadCount } from '@/features/notifications/actions';

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const refreshCounts = useCallback(async () => {
    const count = await getUnreadCount();
    setUnreadNotifications(count);
  }, []);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  useRealtime('notifications', 'INSERT', refreshCounts);
  useRealtime('messages', 'INSERT', useCallback(() => {
    setUnreadMessages((prev) => prev + 1);
  }, []));

  useEffect(() => {
    if (pathname.startsWith('/messages')) setUnreadMessages(0);
  }, [pathname]);

  const NAV_ITEMS = [
    { href: '/feed', icon: Home, label: t('nav.feed'), badge: 0 },
    { href: '/messages', icon: MessageCircle, label: t('messages.title'), badge: unreadMessages },
    { href: '/create', icon: Plus, label: '', isCreate: true, badge: 0 },
    { href: '/reels', icon: Play, label: t('nav.reels'), badge: 0 },
    { href: '/profile', icon: User, label: t('nav.profile'), badge: unreadNotifications },
  ];

  return (
    <nav className="forge-bottom-nav fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-4 py-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label, isCreate, badge }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));

          if (isCreate) {
            return (
              <Link
                key={href}
                href={href}
                className="forge-nav-create h-11 w-11 rounded-full flex items-center justify-center"
              >
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                active ? 'forge-nav-item-active' : 'forge-nav-item'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
              {badge > 0 && (
                <span className="absolute -top-0.5 right-1 h-[18px] min-w-[18px] px-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
