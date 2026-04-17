'use client';

import { useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const WIDGET_LABELS: Record<string, string> = {
  today: '📋 Сегодня',
  stats: '📊 Статистика',
  'recent-notes': '📝 Заметки',
  'recent-workouts': '💪 Тренировки',
  badges: '🏆 Бейджи',
  activity: '📊 Активность за 30 дней',
};

interface Props {
  open: boolean;
  onClose: () => void;
  hiddenWidgets: string[];
  onRestore: (id: string) => void;
}

export function WidgetManager({ open, onClose, hiddenWidgets, onRestore }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || hiddenWidgets.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">Добавить виджет</h3>
          <button onClick={onClose} className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {hiddenWidgets.map((id) => (
            <button
              key={id}
              onClick={() => { onRestore(id); if (hiddenWidgets.length <= 1) onClose(); }}
              className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3 text-left"
            >
              <Plus className="w-4 h-4 text-[var(--forge-purple-bright)] shrink-0" />
              <span className="text-sm text-[var(--forge-text-primary)]">{WIDGET_LABELS[id] || id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
