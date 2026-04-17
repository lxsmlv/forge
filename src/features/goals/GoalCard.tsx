'use client';

import { useTransition } from 'react';
import { Plus, Trash2, Check, Target } from 'lucide-react';
import { updateGoalProgress, deleteGoal } from './actions';

interface GoalProps {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  category: string;
  is_completed: boolean;
  onUpdated: () => void;
}

const CAT_COLORS: Record<string, string> = {
  fitness: 'text-green-400',
  learning: 'text-blue-400',
  health: 'text-emerald-400',
  career: 'text-amber-400',
  personal: 'text-purple-400',
  other: 'text-[var(--forge-text-tertiary)]',
};

export function GoalCard({ id, title, description, target_value, current_value, unit, deadline, category, is_completed, onUpdated }: GoalProps) {
  const [isPending, startTransition] = useTransition();
  const percent = target_value > 0 ? Math.round((current_value / target_value) * 100) : 0;
  const isOverdue = deadline && !is_completed && new Date(deadline) < new Date(new Date().toDateString());

  const handleIncrement = () => {
    startTransition(async () => {
      await updateGoalProgress(id);
      onUpdated();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteGoal(id);
      onUpdated();
    });
  };

  return (
    <div className={`forge-card p-4 transition-all ${is_completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center shrink-0 ${
          is_completed ? 'bg-[var(--forge-success)]/10 border-[var(--forge-success)]/30' : ''
        }`}>
          {is_completed ? (
            <Check className="w-5 h-5 text-[var(--forge-success)]" />
          ) : (
            <Target className={`w-5 h-5 ${CAT_COLORS[category] || CAT_COLORS.other}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[13px] font-semibold ${is_completed ? 'line-through text-[var(--forge-text-muted)]' : 'text-[var(--forge-text-primary)]'}`}>
              {title}
            </span>
            <span className="forge-badge text-[9px] py-0 px-1.5 capitalize">{category}</span>
          </div>

          {description && (
            <p className="text-[11px] text-[var(--forge-text-tertiary)] mb-2">{description}</p>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-2 rounded-full bg-[var(--forge-surface)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(percent, 100)}%`,
                  background: is_completed ? 'var(--forge-success)' : 'var(--forge-gradient-action)',
                }}
              />
            </div>
            <span className="text-[11px] font-bold text-[var(--forge-text-secondary)] tabular-nums shrink-0">
              {current_value}/{target_value} {unit}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {deadline && (
              <span className={`text-[10px] flex items-center gap-1 ${
                isOverdue ? 'text-[var(--forge-error)]' : 'text-[var(--forge-text-muted)]'
              }`}>
                📅 {new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            <span className="text-[10px] text-[var(--forge-purple-bright)] font-medium">{percent}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {!is_completed && (
            <button
              onClick={handleIncrement}
              disabled={isPending}
              className="forge-press h-8 w-8 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center hover:bg-[var(--forge-purple)] hover:border-[var(--forge-purple)] transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-[var(--forge-purple-bright)]" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="forge-press h-8 w-8 rounded-[var(--forge-radius-md)] flex items-center justify-center text-[var(--forge-text-muted)] hover:text-[var(--forge-error)] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
