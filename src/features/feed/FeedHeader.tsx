'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <h1
          className="text-2xl tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>
        <Link href="/messages" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-600/50 transition-colors">
          <MessageCircle className="w-4 h-4 text-zinc-400" />
        </Link>
      </div>
    </header>
  );
}
