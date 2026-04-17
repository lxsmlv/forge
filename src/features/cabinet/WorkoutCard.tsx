'use client';

import { Dumbbell, Clock, Footprints, Zap } from 'lucide-react';

interface WorkoutProps {
  type: string;
  duration_min: number;
  notes: string | null;
  mood: number | null;
  intensity: number | null;
  exercises: Array<{ name: string }> | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Dumbbell; label: string; color: string }> = {
  gym: { icon: Dumbbell, label: 'Gym', color: 'text-green-400' },
  tennis: { icon: Zap, label: 'Tennis', color: 'text-yellow-400' },
  padel: { icon: Zap, label: 'Padel', color: 'text-blue-400' },
  running: { icon: Footprints, label: 'Running', color: 'text-orange-400' },
  other: { icon: Dumbbell, label: 'Other', color: 'text-[var(--forge-text-tertiary)]' },
};

const MOOD_EMOJI: Record<number, string> = { 1: '😫', 2: '😐', 3: '😊', 4: '🔥', 5: '🚀' };
const INTENSITY_LABEL: Record<number, string> = { 1: 'Light', 2: 'Moderate', 3: 'Intense', 4: 'Max' };

export function WorkoutCard({ type, duration_min, notes, mood, intensity, exercises, created_at }: WorkoutProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.other;
  const Icon = config.icon;

  const formatDuration = (min: number) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="forge-card p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--forge-text-primary)]">{config.label}</span>
            {mood && MOOD_EMOJI[mood] && <span className="text-sm" title="Mood">{MOOD_EMOJI[mood]}</span>}
            <span className="text-[11px] text-[var(--forge-text-muted)] ml-auto">{created_at}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-[12px] text-[var(--forge-text-tertiary)]">
              <Clock className="w-3 h-3" /> {formatDuration(duration_min)}
            </span>
            {intensity && INTENSITY_LABEL[intensity] && (
              <span className="forge-badge text-[10px] py-0 px-1.5">{INTENSITY_LABEL[intensity]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Exercises */}
      {exercises && exercises.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {exercises.filter((e) => e.name.trim()).map((ex, i) => (
            <span key={i} className="forge-badge text-[10px] py-0.5 px-2">{ex.name}</span>
          ))}
        </div>
      )}

      {/* Notes */}
      {notes && (
        <p className="mt-2 text-[12px] text-[var(--forge-text-secondary)] leading-relaxed">{notes}</p>
      )}
    </div>
  );
}
