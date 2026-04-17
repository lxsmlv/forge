'use client';

import { X } from 'lucide-react';

interface Workout { id: string; type: string; duration_min: number; created_at: string }
interface Props { workouts: Workout[]; onViewAll: () => void; onHide: () => void }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}м`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}ч`;
  const days = Math.floor(hrs / 24);
  return `${days}д`;
}

export function RecentWorkoutsWidget({ workouts, onViewAll, onHide }: Props) {
  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">💪 Тренировки</span>
        <button onClick={onViewAll} className="text-[10px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] forge-press">все →</button>
      </div>
      {workouts.length === 0 ? (
        <div className="flex flex-col items-center py-3 text-center">
          <div className="text-2xl mb-1">💪</div>
          <p className="text-[11px] text-[var(--forge-text-tertiary)]">Залогируй тренировку</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {workouts.map((w) => (
            <p key={w.id} className="text-[12px] text-[var(--forge-text-primary)] truncate">
              {w.type} — {w.duration_min} мин — {timeAgo(w.created_at)} назад
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
