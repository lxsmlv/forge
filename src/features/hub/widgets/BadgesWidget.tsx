'use client';

import { X } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/achievements';

interface Props { achievements: Array<{ type: string }>; onHide: () => void }

export function BadgesWidget({ achievements, onHide }: Props) {
  if (achievements.length === 0) return null;

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-3">🏆 Бейджи</div>
      <div className="flex gap-2">
        {achievements.map((a) => {
          const info = ACHIEVEMENTS[a.type];
          return info ? (
            <div key={a.type} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{info.emoji}</span>
              <span className="text-[9px] text-[var(--forge-text-tertiary)]">{info.title}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
