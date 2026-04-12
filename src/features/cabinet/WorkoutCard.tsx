'use client';

import { Dumbbell, Clock, Bike, Footprints } from 'lucide-react';

interface WorkoutProps {
  type: string;
  duration_min: number;
  notes: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Dumbbell; label: string; color: string }> = {
  gym: { icon: Dumbbell, label: 'Gym', color: 'text-green-400' },
  tennis: { icon: Bike, label: 'Tennis', color: 'text-yellow-400' },
  padel: { icon: Bike, label: 'Padel', color: 'text-blue-400' },
  running: { icon: Footprints, label: 'Running', color: 'text-orange-400' },
  other: { icon: Dumbbell, label: 'Other', color: 'text-zinc-400' },
};

export function WorkoutCard({ type, duration_min, notes, created_at }: WorkoutProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.other;
  const Icon = config.icon;

  return (
    <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-lg bg-zinc-900 flex items-center justify-center ${config.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{config.label}</span>
          <span className="text-xs text-zinc-600">{created_at}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="w-3 h-3 text-zinc-600" />
          <span className="text-xs text-zinc-500">{duration_min} min</span>
          {notes && <span className="text-xs text-zinc-600">· {notes}</span>}
        </div>
      </div>
    </div>
  );
}
