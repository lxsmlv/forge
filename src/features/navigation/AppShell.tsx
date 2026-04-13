'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

const PAGES_WITH_NAV = ['/feed', '/search', '/profile', '/notifications', '/messages', '/cabinet'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = PAGES_WITH_NAV.some((p) => pathname === p || pathname.startsWith(p + '/'));

  return (
    <>
      {children}
      {showNav && <BottomNav />}
    </>
  );
}
