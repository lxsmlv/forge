'use client';

import { Flame } from 'lucide-react';
import { getLevel, getXpProgress } from '@/lib/xp';

interface Props {
  fullName: string;
  streak: number;
  xp: number;
}

export function GreetingWidget({ fullName, streak, xp }: Props) {
  const firstName = fullName.split(' ')[0] || fullName;
  const level = getLevel(xp);
  const progress = getXpProgress(xp);
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  // 7-day activity dots (placeholder — will be real data with Points engine)
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const todayIdx = (today.getDay() + 6) % 7; // Mon=0

  return (
    <div className="col-span-full forge-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--forge-text-primary)] tracking-tight">{firstName} 👊</h2>
          <p className="text-[12px] text-[var(--forge-text-tertiary)] capitalize mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
              <span className="text-xs font-bold text-orange-400 tabular-nums">{streak}</span>
            </div>
          )}
          <div className="px-3 py-1.5 rounded-full border border-[rgba(139,92,246,0.25)]" style={{ background: 'var(--forge-gradient-subtle)' }}>
            <span className="text-xs font-bold text-[var(--forge-purple-bright)]">Lvl {level}</span>
            <span className="text-[10px] text-[var(--forge-text-tertiary)] ml-1">{progress.current}/{progress.needed} XP</span>
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="h-2 rounded-full bg-[var(--forge-surface)] overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress.percent}%`, background: 'var(--forge-gradient-action)' }}
        />
      </div>

      {/* 7-day activity mini-dots */}
      <div className="flex items-center justify-between">
        {days.map((day, i) => {
          const isToday = i === todayIdx;
          const isPast = i < todayIdx;
          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded-full transition-all ${
                  isToday
                    ? 'bg-[var(--forge-purple)] shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                    : isPast
                      ? 'bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)]'
                      : 'bg-[var(--forge-surface)] border border-[var(--forge-border)]'
                }`}
              />
              <span className={`text-[9px] ${isToday ? 'text-[var(--forge-purple-bright)] font-bold' : 'text-[var(--forge-text-muted)]'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
