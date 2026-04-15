'use client';

import { useState, useEffect, useTransition } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createNote } from './actions';
import { useT } from '@/lib/useT';

const NOTE_CATEGORIES = ['general', 'gym', 'car', 'personal'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NoteCreateModal({ open, onClose, onCreated }: Props) {
  const t = useT();
  const [form, setForm] = useState({ title: '', text: '', category: 'general' });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) setForm({ title: '', text: '', category: 'general' });
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.title.trim()) return;
    startTransition(async () => {
      await createNote(form.title, form.text, form.category);
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
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">New note</h3>
          <button
            onClick={onClose}
            className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Input
          placeholder={t('cabinet.what_done')}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSave()}
          className="forge-input"
        />
        <Textarea
          placeholder={t('cabinet.details')}
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          rows={3}
          className="forge-input resize-none"
        />
        <div className="flex gap-1.5 flex-wrap">
          {NOTE_CATEGORIES.map((cat) => {
            const active = form.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setForm({ ...form, category: cat })}
                className={`forge-badge forge-badge-interactive capitalize ${active ? 'forge-badge-purple' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={isPending || !form.title.trim()}
            className="forge-btn-primary flex-1 py-2.5 text-[13px] uppercase disabled:opacity-50"
            style={{ letterSpacing: '0.08em' }}
          >
            {isPending ? '...' : t('common.add')}
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
