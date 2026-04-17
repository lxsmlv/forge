'use client';

import { X, Dumbbell, StickyNote, CheckCircle2 } from 'lucide-react';

interface Props {
  workoutsCount: number;
  notesCount: number;
  tasksDoneCount: number;
  onHide: () => void;
}

export function StatsWidget({ workoutsCount, notesCount, tasksDoneCount, onHide }: Props) {
  const stats = [
    { icon: Dumbbell, value: workoutsCount, label: 'тренировок', color: 'text-orange-400' },
    { icon: StickyNote, value: notesCount, label: 'заметок', color: 'text-[var(--forge-purple-bright)]' },
    { icon: CheckCircle2, value: tasksDoneCount, label: 'выполнено', color: 'text-[var(--forge-success)]' },
  ];

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-4">📊 Статистика</div>
      <div className="flex gap-3">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)]">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-2xl font-bold text-[var(--forge-text-primary)] tabular-nums">{value}</span>
            <span className="text-[9px] text-[var(--forge-text-tertiary)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
