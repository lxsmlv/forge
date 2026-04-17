'use client';

import { useState, useEffect, useTransition } from 'react';
import { X, Hash, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createNote } from './actions';
import { useT } from '@/lib/useT';

const DEFAULT_CATEGORIES = ['general', 'gym', 'car', 'personal'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NoteCreateModal({ open, onClose, onCreated }: Props) {
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';
  const [form, setForm] = useState({ title: '', text: '', category: 'general', isTask: false, dueDate: '', tags: [] as string[] });
  const [tagInput, setTagInput] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm({ title: '', text: '', category: 'general', isTask: false, dueDate: '', tags: [] });
      setTagInput('');
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.title.trim()) return;
    startTransition(async () => {
      await createNote(form.title, form.text, form.category, form.isTask, form.dueDate || null, form.tags.length > 0 ? form.tags : undefined);
      onCreated();
      onClose();
    });
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-zа-яё0-9_-]/gi, '');
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const catLabels: Record<string, string> = {
    general: isRu ? 'Общее' : 'General',
    gym: t('cat.gym'),
    car: isRu ? 'Авто' : 'Car',
    personal: isRu ? 'Личное' : 'Personal',
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">{t('cabinet.add_note')}</h3>
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

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Категория' : 'Category'}</label>
          <div className="flex gap-1.5 flex-wrap items-center">
            {DEFAULT_CATEGORIES.map((cat) => {
              const active = form.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`forge-badge forge-badge-interactive ${active ? 'forge-badge-purple' : ''}`}
                >
                  {catLabels[cat] || cat}
                </button>
              );
            })}
            {/* Custom category — just type any name */}
            {!DEFAULT_CATEGORIES.includes(form.category as any) && form.category && (
              <span className="forge-badge forge-badge-purple">{form.category}</span>
            )}
            <input
              placeholder={isRu ? '+ своя' : '+ custom'}
              className="bg-transparent text-[11px] text-[var(--forge-text-secondary)] outline-none w-16 placeholder:text-[var(--forge-text-muted)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim().toLowerCase();
                  if (val) {
                    setForm({ ...form, category: val });
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Task toggle + due date */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, isTask: !form.isTask })}
            className={`forge-badge forge-badge-interactive ${form.isTask ? 'forge-badge-purple' : ''}`}
          >
            ☑ {isRu ? 'Задача' : 'Task'}
          </button>
          {form.isTask && (
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="forge-input !py-1.5 !px-3 !text-[12px] flex-1"
            />
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Тэги' : 'Tags'}</label>
          <div className="flex gap-1.5 flex-wrap items-center">
            {form.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="forge-badge forge-badge-purple text-[11px] flex items-center gap-1"
              >
                #{tag} <X className="w-2.5 h-2.5" />
              </button>
            ))}
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-[var(--forge-text-muted)]" />
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
                }}
                onBlur={addTag}
                placeholder={isRu ? 'добавить тэг' : 'add tag'}
                className="bg-transparent text-[12px] text-[var(--forge-text-secondary)] outline-none w-20 placeholder:text-[var(--forge-text-muted)]"
              />
            </div>
          </div>
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
