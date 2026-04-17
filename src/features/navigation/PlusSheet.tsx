'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, StickyNote, Dumbbell, Target, Zap } from 'lucide-react';
import { useT } from '@/lib/useT';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ActionItem {
  icon: typeof Camera;
  title: string;
  desc: string;
  xp: number;
  href: string;
  color: string;
  glow: string;
}

export function PlusSheet({ open, onClose }: Props) {
  const router = useRouter();
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const publicActions: ActionItem[] = [
    {
      icon: Camera,
      title: isRu ? 'Новый пост' : 'New post',
      desc: isRu ? 'Фото или видео в ленту' : 'Photo or video to feed',
      xp: 10,
      href: '/create',
      color: 'text-[var(--forge-purple-bright)]',
      glow: 'bg-[var(--forge-purple-glow)] border-[rgba(139,92,246,0.2)]',
    },
  ];

  const privateActions: ActionItem[] = [
    {
      icon: StickyNote,
      title: isRu ? 'Заметка' : 'Note',
      desc: isRu ? 'Быстрая мысль или идея' : 'Quick thought or idea',
      xp: 5,
      href: '/cabinet?new=note',
      color: 'text-amber-400',
      glow: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      icon: Dumbbell,
      title: isRu ? 'Тренировка' : 'Workout',
      desc: isRu ? 'Записать сессию' : 'Log a session',
      xp: 15,
      href: '/cabinet?new=workout',
      color: 'text-green-400',
      glow: 'bg-green-400/10 border-green-400/20',
    },
    {
      icon: Target,
      title: isRu ? 'Задача' : 'Task',
      desc: isRu ? 'Добавить в чеклист на сегодня' : 'Add to today\'s checklist',
      xp: 10,
      href: '/cabinet?new=note',
      color: 'text-blue-400',
      glow: 'bg-blue-400/10 border-blue-400/20',
    },
  ];

  const renderAction = (action: ActionItem) => (
    <button
      key={action.href + action.title}
      onClick={() => go(action.href)}
      className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3.5 text-left group"
    >
      <div className={`h-11 w-11 rounded-[var(--forge-radius-md)] border flex items-center justify-center shrink-0 ${action.glow} transition-all group-hover:scale-105`}>
        <action.icon className={`w-5 h-5 ${action.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--forge-text-primary)]">{action.title}</p>
        <p className="text-[11px] text-[var(--forge-text-tertiary)] mt-0.5">{action.desc}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)]">
        <Zap className="w-3 h-3 text-[var(--forge-purple-bright)]" />
        <span className="text-[10px] font-bold text-[var(--forge-purple-bright)] tabular-nums">+{action.xp}</span>
      </div>
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-[var(--forge-text-muted)]" />
          <button
            onClick={onClose}
            className="forge-press absolute right-5 top-5 text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-[var(--forge-text-primary)] text-center">
          {isRu ? 'Создать' : 'Create'}
        </h3>

        {/* Public */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[var(--forge-text-muted)] px-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            {isRu ? 'Публичное' : 'Public'}
          </span>
          {publicActions.map(renderAction)}
        </div>

        {/* Private */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[var(--forge-text-muted)] px-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--forge-purple)]" />
            {isRu ? 'Личное' : 'Private'}
          </span>
          {privateActions.map(renderAction)}
        </div>
      </div>
    </div>
  );
}
