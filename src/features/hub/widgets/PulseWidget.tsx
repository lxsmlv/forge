'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/lib/useT';

export function PulseWidget({ userId, onHide }: { userId: string; onHide: () => void }) {
  const [dailyCounts, setDailyCounts] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const t = useT();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const since = new Date();
      since.setDate(since.getDate() - 29);
      const sinceISO = since.toISOString();

      const [postsRes, workoutsRes, notesRes] = await Promise.all([
        supabase.from('posts').select('created_at').eq('author_id', userId).gte('created_at', sinceISO),
        supabase.from('workouts').select('created_at').eq('user_id', userId).gte('created_at', sinceISO),
        supabase.from('notes').select('created_at').eq('user_id', userId).gte('created_at', sinceISO),
      ]);

      const countMap: Record<string, number> = {};
      const all = [
        ...(postsRes.data || []),
        ...(workoutsRes.data || []),
        ...(notesRes.data || []),
      ];
      all.forEach((item) => {
        const day = new Date(item.created_at).toISOString().split('T')[0];
        countMap[day] = (countMap[day] || 0) + 1;
      });

      const days: string[] = [];
      const counts: number[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        days.push(key);
        counts.push(countMap[key] || 0);
      }
      setLabels(days);
      setDailyCounts(counts);
    }
    load();
  }, [userId]);

  if (dailyCounts.length === 0) return null;

  const maxCount = Math.max(...dailyCounts, 1);
  const width = 280;
  const height = 80;
  const padX = 4;
  const padY = 8;
  const graphW = width - padX * 2;
  const graphH = height - padY * 2;

  const points = dailyCounts.map((count, i) => ({
    x: padX + (i / 29) * graphW,
    y: padY + graphH - (count / maxCount) * graphH,
    count,
  }));

  // Smooth curve using quadratic bezier
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` Q ${cpx} ${prev.y} ${curr.x} ${curr.y}`;
  }

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const totalActions = dailyCounts.reduce((sum, c) => sum + c, 0);
  const activeDays = dailyCounts.filter((c) => c > 0).length;

  const formatDay = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  return (
    <div className="forge-card p-4 relative col-span-full">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-3">
        ⚡ {t('hub.pulse')}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-[var(--forge-text-primary)] tabular-nums">{totalActions}</span>
          <span className="text-[10px] text-[var(--forge-text-tertiary)]">{t('hub.actions')}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-[var(--forge-text-primary)] tabular-nums">{activeDays}<span className="text-[var(--forge-text-tertiary)] text-sm font-normal">/30</span></span>
          <span className="text-[10px] text-[var(--forge-text-tertiary)]">{t('hub.active_days')}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onClick={() => setSelectedIdx(null)}
      >
        {/* Gradient fill under curve */}
        <defs>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--forge-purple)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--forge-purple)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Filled area */}
        <path d={areaD} fill="url(#pulseGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--forge-purple-bright)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive hit areas + dots */}
        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - graphW / 60}
              y={0}
              width={graphW / 30}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(selectedIdx === i ? null : i); }}
            />
            {p.count > 0 && (
              <circle
                cx={p.x}
                cy={p.y}
                r={selectedIdx === i ? 4 : 2.5}
                fill={selectedIdx === i ? 'var(--forge-purple-bright)' : 'var(--forge-purple)'}
                stroke="var(--forge-black)"
                strokeWidth="1"
                className="transition-all duration-150"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Selected day tooltip */}
      {selectedIdx !== null && labels[selectedIdx] && (
        <div className="mt-2 text-center">
          <span className="text-[11px] text-[var(--forge-text-tertiary)]">
            {formatDay(labels[selectedIdx])}
          </span>
          <span className="text-[11px] text-[var(--forge-purple-bright)] ml-2 font-medium">
            {dailyCounts[selectedIdx]} {dailyCounts[selectedIdx] === 1 ? t('hub.action') : t('hub.actions')}
          </span>
        </div>
      )}

      {/* Week markers */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] text-[var(--forge-text-muted)]">{formatDay(labels[0])}</span>
        <span className="text-[9px] text-[var(--forge-text-muted)]">{formatDay(labels[14])}</span>
        <span className="text-[9px] text-[var(--forge-text-muted)]">{formatDay(labels[29])}</span>
      </div>
    </div>
  );
}
