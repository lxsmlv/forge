'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/lib/useT';

interface DayActivity {
  type: 'post' | 'workout' | 'note';
  title: string;
}

export function ActivityWidget({ userId, onHide }: { userId: string; onHide: () => void }) {
  const [activity, setActivity] = useState<Record<string, DayActivity[]>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceISO = since.toISOString();

      const [postsRes, workoutsRes, notesRes] = await Promise.all([
        supabase.from('posts').select('created_at, caption').eq('author_id', userId).gte('created_at', sinceISO),
        supabase.from('workouts').select('created_at, type, duration_min').eq('user_id', userId).gte('created_at', sinceISO),
        supabase.from('notes').select('created_at, title').eq('user_id', userId).gte('created_at', sinceISO),
      ]);

      const map: Record<string, DayActivity[]> = {};
      const addDay = (dateStr: string, item: DayActivity) => {
        const day = new Date(dateStr).toISOString().split('T')[0];
        if (!map[day]) map[day] = [];
        map[day].push(item);
      };

      (postsRes.data || []).forEach((p) => addDay(p.created_at, { type: 'post', title: p.caption?.slice(0, 40) || 'Пост' }));
      (workoutsRes.data || []).forEach((w) => addDay(w.created_at, { type: 'workout', title: `${w.type} — ${w.duration_min} мин` }));
      (notesRes.data || []).forEach((n) => addDay(n.created_at, { type: 'note', title: n.title?.slice(0, 40) || 'Заметка' }));

      setActivity(map);
    }
    load();
  }, [userId]);

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const handleDotClick = (day: string, e: React.MouseEvent) => {
    if (!activity[day] || activity[day].length === 0) return;
    if (selectedDay === day) { setSelectedDay(null); return; }

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPopupPos({ x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top - 8 });
    }
    setSelectedDay(day);
  };

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-[var(--forge-surface)] border border-[var(--forge-border)]';
    if (count === 1) return 'bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)]';
    if (count <= 3) return 'bg-[var(--forge-purple)] bg-opacity-40 border border-[rgba(139,92,246,0.3)]';
    return 'bg-[var(--forge-purple)] shadow-[0_0_6px_rgba(139,92,246,0.5)]';
  };

  const typeEmoji = { post: '📸', workout: '💪', note: '📝' };

  return (
    <div className="forge-card p-4 relative col-span-full" ref={containerRef}>
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider mb-3">📊 {t('profile.last_30')}</div>
      <div className="flex gap-[4px] flex-wrap" onClick={() => setSelectedDay(null)}>
        {days.map((day) => {
          const items = activity[day] || [];
          const isSelected = selectedDay === day;
          return (
            <div
              key={day}
              onClick={(e) => { e.stopPropagation(); handleDotClick(day, e); }}
              className={`h-3.5 w-3.5 rounded-[3px] cursor-pointer transition-all hover:scale-125 ${getIntensity(items.length)} ${isSelected ? 'ring-2 ring-[var(--forge-purple-bright)] scale-125' : ''}`}
            />
          );
        })}
      </div>

      {/* Popup */}
      {selectedDay && popupPos && activity[selectedDay] && (
        <div
          className="absolute z-20 forge-glass rounded-[var(--forge-radius-md)] p-3 min-w-[180px] shadow-[var(--forge-shadow-lg)] animate-in fade-in zoom-in-95 duration-150"
          style={{ left: `${Math.min(popupPos.x - 90, 200)}px`, bottom: `calc(100% - ${popupPos.y}px + 4px)` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] text-[var(--forge-text-tertiary)] mb-2">
            {new Date(selectedDay).toLocaleDateString(undefined, { day: 'numeric', month: 'short', weekday: 'short' })}
          </div>
          <div className="flex flex-col gap-1">
            {activity[selectedDay].map((item, i) => (
              <div key={i} className="text-[12px] text-[var(--forge-text-primary)] flex items-center gap-1.5">
                <span>{typeEmoji[item.type]}</span>
                <span className="truncate">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
