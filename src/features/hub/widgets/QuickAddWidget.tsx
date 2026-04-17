'use client';

import { StickyNote, Dumbbell } from 'lucide-react';
import { useT } from '@/lib/useT';

interface Props {
  onAddNote: () => void;
  onAddWorkout: () => void;
}

export function QuickAddWidget({ onAddNote, onAddWorkout }: Props) {
  const t = useT();
  return (
    <div className="col-span-full flex gap-2">
      <button onClick={onAddNote} className="forge-btn-primary flex-1 py-3 text-[13px] flex items-center justify-center gap-2">
        <StickyNote className="w-4 h-4" /> {t('cabinet.add_note')}
      </button>
      <button onClick={onAddWorkout} className="forge-btn-secondary flex-1 py-3 text-[13px] flex items-center justify-center gap-2">
        <Dumbbell className="w-4 h-4" /> {t('cabinet.log_workout')}
      </button>
    </div>
  );
}
