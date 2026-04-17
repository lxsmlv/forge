'use client';

import { useState, useEffect, useTransition } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createGoal } from './actions';
import { useT } from '@/lib/useT';

const CATEGORIES = ['fitness', 'learning', 'health', 'career', 'personal', 'other'];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function GoalCreateModal({ open, onClose, onCreated }: Props) {
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';
  const [form, setForm] = useState({ title: '', description: '', target: '1', unit: '', deadline: '', category: 'fitness' });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) setForm({ title: '', description: '', target: '1', unit: '', deadline: '', category: 'fitness' });
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.title.trim()) return;
    startTransition(async () => {
      await createGoal(form.title, form.description, parseInt(form.target) || 1, form.unit, form.deadline || null, form.category);
      onCreated();
      onClose();
    });
  };

  const catLabels: Record<string, string> = isRu
    ? { fitness: 'Фитнес', learning: 'Обучение', health: 'Здоровье', career: 'Карьера', personal: 'Личное', other: 'Другое' }
    : { fitness: 'Fitness', learning: 'Learning', health: 'Health', career: 'Career', personal: 'Personal', other: 'Other' };

  const presets = isRu
    ? [
        { title: 'Прочитать книгу', target: '300', unit: 'стр' },
        { title: 'Тренировки в месяц', target: '12', unit: 'тренировок' },
        { title: 'Бегать каждую неделю', target: '4', unit: 'пробежек' },
        { title: 'Медитация', target: '30', unit: 'дней' },
      ]
    : [
        { title: 'Read a book', target: '300', unit: 'pages' },
        { title: 'Monthly workouts', target: '12', unit: 'workouts' },
        { title: 'Run every week', target: '4', unit: 'runs' },
        { title: 'Meditation', target: '30', unit: 'days' },
      ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">{isRu ? 'Новая цель' : 'New goal'}</h3>
          <button onClick={onClose} className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets */}
        {!form.title && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Быстрый старт' : 'Quick start'}</label>
            <div className="flex gap-1.5 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.title}
                  onClick={() => setForm({ ...form, title: p.title, target: p.target, unit: p.unit })}
                  className="forge-badge forge-badge-interactive text-[11px]"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          placeholder={isRu ? 'Название цели' : 'Goal title'}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
          className="forge-input"
        />

        <Textarea
          placeholder={isRu ? 'Описание (необязательно)' : 'Description (optional)'}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="forge-input resize-none"
        />

        {/* Target + Unit */}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Цель' : 'Target'}</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="10"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value.replace(/\D/g, '') })}
              className="forge-input"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Единица' : 'Unit'}</label>
            <Input
              placeholder={isRu ? 'раз, стр, км...' : 'times, pages, km...'}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="forge-input"
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Дедлайн' : 'Deadline'}</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="forge-input !py-2 !px-3 !text-[13px]"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{isRu ? 'Категория' : 'Category'}</label>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setForm({ ...form, category: cat })}
                className={`forge-badge forge-badge-interactive ${form.category === cat ? 'forge-badge-purple' : ''}`}
              >
                {catLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleSave}
            disabled={isPending || !form.title.trim()}
            className="forge-btn-primary flex-1 py-2.5 text-[13px] uppercase disabled:opacity-50"
            style={{ letterSpacing: '0.08em' }}
          >
            {isPending ? '...' : isRu ? 'Создать' : 'Create'}
          </button>
          <button onClick={onClose} className="forge-btn-secondary flex-1 py-2.5 text-[13px]">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}
