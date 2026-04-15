'use client';

import { useState, useEffect, useTransition } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createWorkout } from './actions';
import { useT } from '@/lib/useT';

const WORKOUT_TYPES = ['gym', 'tennis', 'padel', 'running', 'other'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function WorkoutCreateModal({ open, onClose, onCreated }: Props) {
  const t = useT();
  const [form, setForm] = useState({ type: 'gym', duration: '', notes: '' });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) setForm({ type: 'gym', duration: '', notes: '' });
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    const dur = parseInt(form.duration);
    if (!dur || dur <= 0) return;
    startTransition(async () => {
      await createWorkout(form.type, dur, form.notes);
      onCreated();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">Log workout</h3>
          <button
            onClick={onClose}
            className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {WORKOUT_TYPES.map((type) => {
            const active = form.type === type;
            return (
              <button
                key={type}
                onClick={() => setForm({ ...form, type })}
                className={`forge-badge forge-badge-interactive capitalize ${active ? 'forge-badge-purple' : ''}`}
              >
                {type}
              </button>
            );
          })}
        </div>
        <Input
          type="text"
          inputMode="numeric"
          placeholder={t('cabinet.duration')}
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value.replace(/\D/g, '') })}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="forge-input"
        />
        <Input
          placeholder={t('cabinet.details')}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="forge-input"
        />
        <div className="flex gap-2 mt-2">
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
