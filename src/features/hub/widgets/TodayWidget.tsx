'use client';

import { useTransition } from 'react';
import { toggleTaskDone } from '@/features/hub/actions';
import { X } from 'lucide-react';

interface Task { id: string; title: string; is_done: boolean }
interface Props { tasks: Task[]; onToggle: (id: string) => void; onHide: () => void }

export function TodayWidget({ tasks, onToggle, onHide }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string) => {
    onToggle(id);
    startTransition(() => { toggleTaskDone(id); });
  };

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-3">📋 Сегодня</div>
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-[13px] text-[var(--forge-text-secondary)] font-medium">Свободный день</p>
          <p className="text-[11px] text-[var(--forge-text-tertiary)] mt-1">Добавь задачу через + или запиши заметку</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.slice(0, 5).map((task) => (
            <button key={task.id} onClick={() => handleToggle(task.id)} disabled={isPending} className="flex items-center gap-2.5 text-left forge-press">
              <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center transition-colors ${
                task.is_done ? 'bg-[var(--forge-purple)]' : 'border-2 border-[var(--forge-text-muted)]'
              }`}>
                {task.is_done && <span className="text-[9px]" style={{ color: '#fff' }}>✓</span>}
              </div>
              <span className={`text-[13px] ${task.is_done ? 'line-through text-[var(--forge-text-muted)]' : 'text-[var(--forge-text-primary)]'}`}>
                {task.title}
              </span>
            </button>
          ))}
          {tasks.length > 5 && <span className="text-[11px] text-[var(--forge-purple-bright)]">ещё {tasks.length - 5} →</span>}
        </div>
      )}
    </div>
  );
}
