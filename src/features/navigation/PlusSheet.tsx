'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, StickyNote, Dumbbell } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PlusSheet({ open, onClose }: Props) {
  const router = useRouter();

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

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="forge-glass w-full max-w-lg mx-auto rounded-t-[var(--forge-radius-xl)] p-5 pb-8 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-[var(--forge-text-muted)]" />
          <button
            onClick={onClose}
            className="forge-press absolute right-5 top-5 text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)] px-1">Public</span>
          <button
            onClick={() => go('/create')}
            className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3 text-left"
          >
            <div className="h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-[var(--forge-purple-bright)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--forge-text-primary)]">New post</p>
              <p className="text-xs text-[var(--forge-text-tertiary)]">Share a photo</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)] px-1">Private</span>
          <button
            onClick={() => go('/cabinet?new=note')}
            className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3 text-left"
          >
            <div className="h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
              <StickyNote className="w-5 h-5 text-[var(--forge-purple-bright)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--forge-text-primary)]">Note</p>
              <p className="text-xs text-[var(--forge-text-tertiary)]">Quick thought</p>
            </div>
          </button>
          <button
            onClick={() => go('/cabinet?new=workout')}
            className="forge-card forge-card-interactive flex items-center gap-3 px-4 py-3 text-left"
          >
            <div className="h-10 w-10 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-[var(--forge-purple-bright)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--forge-text-primary)]">Workout</p>
              <p className="text-xs text-[var(--forge-text-tertiary)]">Log a session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
