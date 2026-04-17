'use client';

import { X } from 'lucide-react';

interface Props {
  workoutsCount: number;
  notesCount: number;
  tasksDoneCount: number;
  onHide: () => void;
}

export function StatsWidget({ workoutsCount, notesCount, tasksDoneCount, onHide }: Props) {
  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-3">📊 Статистика</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-xl font-bold text-[var(--forge-text-primary)] tabular-nums">💪 {workoutsCount}</div>
          <div className="text-[9px] text-[var(--forge-text-tertiary)] mt-0.5">тренировок</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold text-[var(--forge-text-primary)] tabular-nums">📝 {notesCount}</div>
          <div className="text-[9px] text-[var(--forge-text-tertiary)] mt-0.5">заметок</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold text-[var(--forge-text-primary)] tabular-nums">✅ {tasksDoneCount}</div>
          <div className="text-[9px] text-[var(--forge-text-tertiary)] mt-0.5">выполнено</div>
        </div>
      </div>
    </div>
  );
}
