'use client';

import { X } from 'lucide-react';
import { useT } from '@/lib/useT';

interface Workout { id: string; type: string; duration_min: number; mood?: number | null; created_at: string }
interface Props { workouts: Workout[]; onViewAll: () => void; onHide: () => void }

const MOOD_EMOJI: Record<number, string> = { 1: '😫', 2: '😐', 3: '😊', 4: '🔥', 5: '🚀' };

function timeAgo(dateStr: string, isRu: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}${isRu ? 'м' : 'm'}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${isRu ? 'ч' : 'h'}`;
  const days = Math.floor(hrs / 24);
  return `${days}${isRu ? 'д' : 'd'}`;
}

export function RecentWorkoutsWidget({ workouts, onViewAll, onHide }: Props) {
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">💪 {t('cabinet.workouts')}</span>
        <button onClick={onViewAll} className="text-[10px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] forge-press">{isRu ? 'все' : 'all'} →</button>
      </div>
      {workouts.length === 0 ? (
        <div className="flex flex-col items-center py-3 text-center">
          <div className="text-2xl mb-1">💪</div>
          <p className="text-[11px] text-[var(--forge-text-tertiary)]">{t('cabinet.log_workout')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {workouts.map((w) => (
            <div key={w.id} className="flex items-center gap-2">
              <p className="text-[13px] text-[var(--forge-text-primary)] font-medium truncate flex-1">
                {w.type} — {w.duration_min} {isRu ? 'мин' : 'min'}
              </p>
              {w.mood && MOOD_EMOJI[w.mood] && <span className="text-sm">{MOOD_EMOJI[w.mood]}</span>}
              <span className="text-[11px] text-[var(--forge-text-muted)] shrink-0">{timeAgo(w.created_at, isRu)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
