'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

const PAGES_WITH_NAV = ['/feed', '/search', '/profile', '/notifications', '/messages', '/cabinet', '/reels'];

// Full-screen pages where bottom nav hides (e.g. individual chat — input bar replaces nav)
const HIDE_NAV_REGEX = [
  /^\/messages\/[^/]+$/, // /messages/:userId — 1:1 chat, full-screen input
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inSection = PAGES_WITH_NAV.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const hidden = HIDE_NAV_REGEX.some((re) => re.test(pathname));
  const showNav = inSection && !hidden;

  return (
    <>
      {children}
      {showNav && <BottomNav />}
    </>
  );
}
