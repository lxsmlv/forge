'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createWorkout } from './actions';
import { useT } from '@/lib/useT';

const WORKOUT_TYPES = ['gym', 'tennis', 'padel', 'running', 'other'] as const;

const MOOD_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Тяжело' },
  { value: 2, emoji: '😐', label: 'Нормально' },
  { value: 3, emoji: '😊', label: 'Хорошо' },
  { value: 4, emoji: '🔥', label: 'Огонь' },
  { value: 5, emoji: '🚀', label: 'Космос' },
];

const INTENSITY_OPTIONS = [
  { value: 1, label: 'Light', labelRu: 'Лёгкая' },
  { value: 2, label: 'Moderate', labelRu: 'Средняя' },
  { value: 3, label: 'Intense', labelRu: 'Интенсивная' },
  { value: 4, label: 'Max', labelRu: 'Максимум' },
];

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

interface Exercise {
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function WorkoutCreateModal({ open, onClose, onCreated }: Props) {
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';
  const [form, setForm] = useState({
    type: 'gym',
    duration: '',
    notes: '',
    mood: 0,
    intensity: 0,
    exercises: [] as Exercise[],
  });
  const [isPending, startTransition] = useTransition();
  const [showExercises, setShowExercises] = useState(false);
  const exerciseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) setForm({ type: 'gym', duration: '', notes: '', mood: 0, intensity: 0, exercises: [] });
    setShowExercises(false);
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    const dur = parseInt(form.duration);
    if (!dur || dur <= 0) return;
    startTransition(async () => {
      await createWorkout(
        form.type,
        dur,
        form.notes,
        form.mood || undefined,
        form.intensity || undefined,
        form.exercises.length > 0 ? form.exercises : undefined,
      );
      onCreated();
      onClose();
    });
  };

  const addExercise = () => {
    setForm({ ...form, exercises: [...form.exercises, { name: '' }] });
    setShowExercises(true);
    setTimeout(() => exerciseInputRef.current?.focus(), 50);
  };

  const updateExercise = (idx: number, name: string) => {
    const updated = [...form.exercises];
    updated[idx] = { name };
    setForm({ ...form, exercises: updated });
  };

  const removeExercise = (idx: number) => {
    setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== idx) });
  };

  const formatDuration = (min: number) => {
    if (min < 60) return `${min} ${isRu ? 'мин' : 'min'}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}${isRu ? 'ч' : 'h'} ${m}${isRu ? 'мин' : 'm'}` : `${h}${isRu ? 'ч' : 'h'}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">{t('cabinet.log_workout')}</h3>
          <button
            onClick={onClose}
            className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workout type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Тип' : 'Type'}</label>
          <div className="flex gap-1.5 flex-wrap items-center">
            {WORKOUT_TYPES.map((type) => {
              const active = form.type === type;
              return (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, type })}
                  className={`forge-badge forge-badge-interactive capitalize ${active ? 'forge-badge-purple' : ''}`}
                >
                  {t(`cat.${type}`)}
                </button>
              );
            })}
            {!WORKOUT_TYPES.includes(form.type as any) && form.type && (
              <span className="forge-badge forge-badge-purple capitalize">{form.type}</span>
            )}
            <input
              placeholder={isRu ? '+ своё' : '+ custom'}
              className="bg-transparent text-[11px] text-[var(--forge-text-secondary)] outline-none w-16 placeholder:text-[var(--forge-text-muted)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim().toLowerCase();
                  if (val) {
                    setForm({ ...form, type: val });
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Duration — preset chips + custom input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{t('cabinet.duration')}</label>
          <div className="flex gap-1.5 flex-wrap">
            {DURATION_PRESETS.map((min) => {
              const active = form.duration === String(min);
              return (
                <button
                  key={min}
                  onClick={() => setForm({ ...form, duration: String(min) })}
                  className={`forge-badge forge-badge-interactive tabular-nums ${active ? 'forge-badge-purple' : ''}`}
                >
                  {formatDuration(min)}
                </button>
              );
            })}
          </div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder={isRu ? 'Или введите минуты…' : 'Or enter minutes…'}
            value={DURATION_PRESETS.includes(Number(form.duration)) ? '' : form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value.replace(/\D/g, '') })}
            className="forge-input text-[13px]"
          />
        </div>

        {/* Intensity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Интенсивность' : 'Intensity'}</label>
          <div className="flex gap-1.5">
            {INTENSITY_OPTIONS.map((opt) => {
              const active = form.intensity === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, intensity: active ? 0 : opt.value })}
                  className={`forge-badge forge-badge-interactive flex-1 justify-center ${active ? 'forge-badge-purple' : ''}`}
                >
                  {isRu ? opt.labelRu : opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood — how did you feel? */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Самочувствие' : 'How did it feel?'}</label>
          <div className="flex gap-2 justify-between">
            {MOOD_OPTIONS.map((opt) => {
              const active = form.mood === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, mood: active ? 0 : opt.value })}
                  className={`forge-press flex flex-col items-center gap-1 py-2 px-2 rounded-[var(--forge-radius-md)] transition-all ${
                    active
                      ? 'bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.3)] scale-110'
                      : 'border border-transparent hover:bg-[var(--forge-surface)]'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-[9px] text-[var(--forge-text-tertiary)]">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Упражнения' : 'Exercises'}</label>
            <button
              onClick={addExercise}
              className="forge-press text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] flex items-center gap-1 text-[11px]"
            >
              <Plus className="w-3 h-3" /> {isRu ? 'Добавить' : 'Add'}
            </button>
          </div>
          {form.exercises.map((ex, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                ref={i === form.exercises.length - 1 ? exerciseInputRef : undefined}
                placeholder={isRu ? `Упражнение ${i + 1}` : `Exercise ${i + 1}`}
                value={ex.name}
                onChange={(e) => updateExercise(i, e.target.value)}
                className="forge-input text-[13px] flex-1"
              />
              <button
                onClick={() => removeExercise(i)}
                className="forge-press text-[var(--forge-text-muted)] hover:text-[var(--forge-error)] p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <Input
          placeholder={t('cabinet.details')}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="forge-input text-[13px]"
        />

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleSave}
            disabled={isPending || !form.duration}
            className="forge-btn-primary flex-1 py-2.5 text-[13px] uppercase disabled:opacity-50"
            style={{ letterSpacing: '0.08em' }}
          >
            {isPending ? '...' : t('cabinet.log_workout')}
          </button>
          <button
            onClick={onClose}
            className="forge-btn-secondary flex-1 py-2.5 text-[13px]"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
