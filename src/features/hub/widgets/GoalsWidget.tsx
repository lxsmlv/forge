'use client';

import { useState, useEffect, useTransition } from 'react';
import { X, Plus, Target } from 'lucide-react';
import { getGoals, updateGoalProgress } from '@/features/goals/actions';
import { useT } from '@/lib/useT';

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  is_completed: boolean;
}

export function GoalsWidget({ onHide, onViewAll }: { onHide: () => void; onViewAll: () => void }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isPending, startTransition] = useTransition();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';

  useEffect(() => {
    getGoals().then((data) => setGoals(data.slice(0, 3)));
  }, []);

  const handleIncrement = (goalId: string) => {
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, current_value: Math.min(g.current_value + 1, g.target_value) } : g));
    startTransition(async () => {
      await updateGoalProgress(goalId);
      const updated = await getGoals();
      setGoals(updated.slice(0, 3));
    });
  };

  const activeGoals = goals.filter((g) => !g.is_completed);

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">🎯 {isRu ? 'Цели' : 'Goals'}</span>
        <button onClick={onViewAll} className="text-[10px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] forge-press">
          {isRu ? 'все' : 'all'} →
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div className="flex flex-col items-center py-3 text-center">
          <Target className="w-6 h-6 text-[var(--forge-text-muted)] mb-1" />
          <p className="text-[11px] text-[var(--forge-text-tertiary)]">{isRu ? 'Поставь первую цель' : 'Set your first goal'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activeGoals.map((g) => {
            const percent = g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0;
            return (
              <div key={g.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[var(--forge-text-primary)] truncate">{g.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--forge-surface)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'var(--forge-gradient-action)' }} />
                    </div>
                    <span className="text-[9px] text-[var(--forge-text-muted)] tabular-nums shrink-0">{g.current_value}/{g.target_value}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleIncrement(g.id)}
                  disabled={isPending}
                  className="forge-press h-6 w-6 rounded-full bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0 disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 text-[var(--forge-purple-bright)]" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
