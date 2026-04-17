'use client';

import { Check, Circle, Car, Dumbbell, User, FileText, Trash2, Pin } from 'lucide-react';

interface NoteProps {
  id: string;
  title: string;
  text: string;
  category: 'car' | 'gym' | 'personal' | 'general';
  is_done: boolean;
  is_task: boolean;
  due_date: string | null;
  tags: string[] | null;
  pinned: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_CONFIG = {
  car: { icon: Car, color: 'text-blue-400' },
  gym: { icon: Dumbbell, color: 'text-green-400' },
  personal: { icon: User, color: 'text-orange-400' },
  general: { icon: FileText, color: 'text-[var(--forge-text-tertiary)]' },
};

export function NoteCard({ id, title, text, category, is_done, is_task, due_date, tags, pinned, onToggle, onDelete }: NoteProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
  const Icon = config.icon;

  const isOverdue = due_date && !is_done && new Date(due_date) < new Date(new Date().toDateString());

  return (
    <div
      className={`forge-card p-4 transition-all ${
        is_done ? 'opacity-50' : ''
      } ${pinned ? 'border-[rgba(139,92,246,0.3)]' : ''}`}
    >
      <div className="flex gap-3">
        {/* Toggle (only for tasks) */}
        {is_task && (
          <button onClick={() => onToggle(id)} className="mt-0.5 shrink-0 forge-press">
            {is_done ? (
              <div className="h-5 w-5 rounded-full bg-[var(--forge-purple)] flex items-center justify-center shadow-[0_0_6px_rgba(139,92,246,0.4)]">
                <Check className="w-3 h-3" style={{ color: '#fff' }} />
              </div>
            ) : (
              <Circle className="h-5 w-5 text-[var(--forge-border-hover)] hover:text-[var(--forge-purple-bright)] transition-colors" />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {pinned && <Pin className="w-3 h-3 text-[var(--forge-purple-bright)] shrink-0" />}
            <span className={`text-sm font-medium ${is_done ? 'line-through text-[var(--forge-text-muted)]' : 'text-[var(--forge-text-primary)]'}`}>
              {title}
            </span>
            <span className={`forge-badge text-[9px] py-0 px-1.5 ${config.color}`}>
              <Icon className="w-2.5 h-2.5" />
              {category}
            </span>
          </div>

          {text && (
            <p className={`text-[12px] leading-relaxed ${is_done ? 'text-[var(--forge-text-muted)]' : 'text-[var(--forge-text-secondary)]'}`}>{text}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {due_date && (
              <span className={`text-[11px] flex items-center gap-1 ${
                isOverdue ? 'text-[var(--forge-error)]' : is_done ? 'text-[var(--forge-text-muted)]' : 'text-[var(--forge-text-tertiary)]'
              }`}>
                📅 {new Date(due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            {tags && tags.length > 0 && tags.map((tag) => (
              <span key={tag} className="forge-badge forge-badge-purple text-[9px] py-0 px-1.5">#{tag}</span>
            ))}
          </div>
        </div>

        <button onClick={() => onDelete(id)} className="shrink-0 text-[var(--forge-text-muted)] hover:text-[var(--forge-error)] transition-colors forge-press">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
