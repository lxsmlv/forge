'use client';

import { ReactNode } from 'react';

interface Props {
  rightContent?: ReactNode;
}

export function TopBar({ rightContent }: Props) {
  return (
    <header className="forge-header sticky top-0 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-2.5">
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="text-[22px] tracking-[0.18em] font-medium forge-text-glow"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </button>
        {rightContent && (
          <div className="flex items-center gap-2.5">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}
