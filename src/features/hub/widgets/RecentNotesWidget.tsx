'use client';

import { X } from 'lucide-react';
import { useT } from '@/lib/useT';

interface Note { id: string; title: string; is_done: boolean }
interface Props { notes: Note[]; onViewAll: () => void; onHide: () => void }

export function RecentNotesWidget({ notes, onViewAll, onHide }: Props) {
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';

  return (
    <div className="forge-card p-4 relative">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press"><X className="w-3.5 h-3.5" /></button>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">📝 {t('cabinet.notes')}</span>
        <button onClick={onViewAll} className="text-[10px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] forge-press">{isRu ? 'все' : 'all'} →</button>
      </div>
      {notes.length === 0 ? (
        <div className="flex flex-col items-center py-3 text-center">
          <div className="text-2xl mb-1">📝</div>
          <p className="text-[11px] text-[var(--forge-text-tertiary)]">{t('cabinet.add_note')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {notes.map((n) => (
            <p key={n.id} className={`text-[13px] truncate ${n.is_done ? 'line-through text-[var(--forge-text-tertiary)]' : 'text-[var(--forge-text-primary)] font-medium'}`}>
              {n.title}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
