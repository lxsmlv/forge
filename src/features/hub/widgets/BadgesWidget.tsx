'use client';

import { X } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { useT } from '@/lib/useT';
import { getLocale } from '@/lib/i18n';

interface Props { achievements: Array<{ type: string }>; onHide: () => void }

export function BadgesWidget({ achievements, onHide }: Props) {
  const t = useT();
  const isRu = typeof window !== 'undefined' && getLocale() === 'ru';

  if (achievements.length === 0) return null;

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-3">🏆 {t('profile.achievements')}</div>
      <div className="flex gap-2 flex-wrap">
        {achievements.map((a) => {
          const info = ACHIEVEMENTS[a.type];
          return info ? (
            <div key={a.type} className="flex flex-col items-center gap-1 min-w-[48px]">
              <span className="text-2xl">{info.emoji}</span>
              <span className="text-[9px] text-[var(--forge-text-tertiary)] text-center leading-tight">{isRu ? info.titleRu : info.title}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
