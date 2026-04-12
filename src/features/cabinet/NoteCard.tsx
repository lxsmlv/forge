'use client';

import { Check, Circle, Car, Dumbbell, User, FileText, Trash2 } from 'lucide-react';

interface NoteProps {
  id: string;
  title: string;
  text: string;
  category: 'car' | 'gym' | 'personal' | 'general';
  is_done: boolean;
  due_date: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_CONFIG = {
  car: { icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  gym: { icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  personal: { icon: User, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  general: { icon: FileText, color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/30' },
};

export function NoteCard({ id, title, text, category, is_done, due_date, onToggle, onDelete }: NoteProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <div
      className={`bg-zinc-950 border rounded-xl p-4 transition-all ${
        is_done ? 'border-zinc-800/30 opacity-50' : 'border-zinc-800/50'
      }`}
    >
      <div className="flex gap-3">
        {/* Toggle */}
        <button onClick={() => onToggle(id)} className="mt-0.5 shrink-0">
          {is_done ? (
            <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : (
            <Circle className="h-5 w-5 text-zinc-700 hover:text-purple-400 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${is_done ? 'line-through text-zinc-600' : 'text-white'}`}>
              {title}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.border} ${config.color} border uppercase tracking-wider`}>
              <Icon className="w-2.5 h-2.5 inline mr-0.5" />
              {category}
            </span>
          </div>
          {text && (
            <p className={`text-xs ${is_done ? 'text-zinc-700' : 'text-zinc-500'}`}>{text}</p>
          )}
          {due_date && (
            <p className={`text-xs mt-1 ${is_done ? 'text-zinc-700' : 'text-zinc-600'}`}>📅 {due_date}</p>
          )}
        </div>

        <button onClick={() => onDelete(id)} className="shrink-0 text-zinc-800 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
