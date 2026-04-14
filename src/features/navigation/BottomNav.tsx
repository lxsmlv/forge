'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageCircle, Plus, Play, User } from 'lucide-react';
import { useT } from '@/lib/useT';

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  const NAV_ITEMS = [
    { href: '/feed', icon: Home, label: t('nav.feed') },
    { href: '/messages', icon: MessageCircle, label: t('messages.title') },
    { href: '/create', icon: Plus, label: t('nav.post'), isCreate: true },
    { href: '/reels', icon: Play, label: t('nav.reels') },
    { href: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-zinc-800/50 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, isCreate }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));

          if (isCreate) {
            return (
              <Link
                key={href}
                href={href}
                className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center transition-all active:scale-95"
              >
                <Icon className="w-5 h-5 text-white" />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active ? 'text-purple-400' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
