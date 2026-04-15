'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageCircle, Plus, BookOpen, User } from 'lucide-react';
import { useT } from '@/lib/useT';
import { useAblyEvent } from '@/lib/ably/client-provider';
import { getUnreadCount } from '@/features/notifications/actions';
import { getUnreadMessagesCount } from '@/features/messages/actions';
import { PlusSheet } from './PlusSheet';

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [plusOpen, setPlusOpen] = useState(false);

  const refreshNotifications = useCallback(async () => {
    const count = await getUnreadCount();
    setUnreadNotifications(count);
  }, []);

  const refreshMessages = useCallback(async () => {
    const count = await getUnreadMessagesCount();
    setUnreadMessages(count);
  }, []);

  useEffect(() => {
    refreshNotifications();
    refreshMessages();
  }, [refreshNotifications, refreshMessages]);

  useAblyEvent('notification:new', refreshNotifications);
  useAblyEvent('message:new', refreshMessages);
  useAblyEvent('message:echo', refreshMessages);

  useEffect(() => {
    if (pathname.startsWith('/messages')) {
      setUnreadMessages(0);
      setTimeout(refreshMessages, 500);
    }
    if (pathname.startsWith('/notifications') || pathname === '/profile') {
      setUnreadNotifications(0);
      setTimeout(refreshNotifications, 500);
    }
  }, [pathname, refreshMessages, refreshNotifications]);

  const LEFT_ITEMS = [
    { href: '/feed', icon: Home, label: t('nav.feed'), badge: 0 },
    { href: '/messages', icon: MessageCircle, label: t('messages.title'), badge: unreadMessages },
  ];

  const RIGHT_ITEMS = [
    { href: '/cabinet', icon: BookOpen, label: t('feed.tab_cabinet'), badge: 0 },
    { href: '/profile', icon: User, label: t('nav.profile'), badge: 0 },
  ];

  const renderItem = ({ href, icon: Icon, label, badge }: { href: string; icon: typeof Home; label: string; badge: number }) => {
    const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));
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
  };

  return (
    <>
      <nav className="forge-bottom-nav fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around px-4 py-1.5">
          {LEFT_ITEMS.map(renderItem)}

          <button
            type="button"
            onClick={() => setPlusOpen(true)}
            className="forge-nav-create h-11 w-11 rounded-full flex items-center justify-center"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} style={{ color: '#ffffff' }} />
          </button>

          {RIGHT_ITEMS.map(renderItem)}
        </div>
      </nav>

      <PlusSheet open={plusOpen} onClose={() => setPlusOpen(false)} />
    </>
  );
}
