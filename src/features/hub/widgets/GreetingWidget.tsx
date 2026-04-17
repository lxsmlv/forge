'use client';

import { Flame } from 'lucide-react';

interface Props {
  fullName: string;
  streak: number;
}

export function GreetingWidget({ fullName, streak }: Props) {
  const firstName = fullName.split(' ')[0] || fullName;
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="col-span-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--forge-text-primary)]">{firstName} 👊</h2>
          <p className="text-[11px] text-[var(--forge-text-tertiary)] capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/8 border border-orange-500/15">
              <Flame className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
              <span className="text-xs font-semibold text-orange-400 tabular-nums">{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)]">
            <span className="text-xs font-bold text-[var(--forge-purple-bright)]">Lvl 1</span>
            <span className="text-[10px] text-[var(--forge-text-tertiary)]">· 0 XP</span>
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--forge-surface)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '0%', background: 'var(--forge-gradient-action)' }} />
      </div>
    </div>
  );
}
