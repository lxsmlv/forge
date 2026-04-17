'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/lib/useT';

interface DayEvent {
  type: 'task' | 'workout' | 'note';
  title: string;
  done?: boolean;
}

export function CalendarWidget({ userId, onHide }: { userId: string; onHide: () => void }) {
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [events, setEvents] = useState<Record<string, DayEvent[]>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const [tasksRes, workoutsRes, notesRes] = await Promise.all([
        supabase.from('notes').select('title, due_date, is_done').eq('user_id', userId).eq('is_task', true).gte('due_date', firstDay).lte('due_date', lastDay),
        supabase.from('workouts').select('type, duration_min, created_at').eq('user_id', userId).gte('created_at', `${firstDay}T00:00:00`).lte('created_at', `${lastDay}T23:59:59`),
        supabase.from('notes').select('title, created_at').eq('user_id', userId).eq('is_task', false).gte('created_at', `${firstDay}T00:00:00`).lte('created_at', `${lastDay}T23:59:59`),
      ]);

      const map: Record<string, DayEvent[]> = {};
      const addDay = (day: string, event: DayEvent) => {
        if (!map[day]) map[day] = [];
        map[day].push(event);
      };

      (tasksRes.data || []).forEach((task) => {
        if (task.due_date) addDay(task.due_date, { type: 'task', title: task.title, done: task.is_done });
      });
      (workoutsRes.data || []).forEach((w) => {
        const day = new Date(w.created_at).toISOString().split('T')[0];
        addDay(day, { type: 'workout', title: `${w.type} — ${w.duration_min} ${isRu ? 'мин' : 'min'}` });
      });
      (notesRes.data || []).forEach((n) => {
        const day = new Date(n.created_at).toISOString().split('T')[0];
        addDay(day, { type: 'note', title: n.title });
      });

      setEvents(map);
    }
    load();
  }, [userId, year, month, isRu]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const today = new Date().toISOString().split('T')[0];

  const weekDays = isRu
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const monthLabel = currentMonth.toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const typeEmoji: Record<string, string> = { task: '☑', workout: '💪', note: '📝' };

  return (
    <div className="forge-card p-4 relative col-span-full">
      <button onClick={onHide} className="absolute top-3 right-3 text-[var(--forge-text-muted)] hover:text-[var(--forge-text-tertiary)] forge-press">
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">📅 {isRu ? 'Календарь' : 'Calendar'}</span>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[12px] font-medium text-[var(--forge-text-secondary)] capitalize min-w-[120px] text-center">{monthLabel}</span>
          <button onClick={nextMonth} className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[9px] text-[var(--forge-text-muted)] uppercase py-1">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayEvents = events[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDay;
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDay(isSelected ? null : (hasEvents ? dateStr : null))}
              className={`forge-press relative aspect-square flex flex-col items-center justify-center rounded-[var(--forge-radius-sm)] text-[12px] transition-all ${
                isToday
                  ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] font-bold border border-[rgba(139,92,246,0.3)]'
                  : isSelected
                    ? 'bg-[var(--forge-surface)] text-[var(--forge-text-primary)] border border-[var(--forge-border-hover)]'
                    : 'text-[var(--forge-text-secondary)] hover:bg-[var(--forge-surface)] border border-transparent'
              }`}
            >
              {dayNum}
              {hasEvents && (
                <div className="flex gap-0.5 absolute bottom-0.5">
                  {dayEvents.length <= 3 ? (
                    dayEvents.map((_, j) => (
                      <div key={j} className="w-1 h-1 rounded-full bg-[var(--forge-purple)]" />
                    ))
                  ) : (
                    <>
                      <div className="w-1 h-1 rounded-full bg-[var(--forge-purple)]" />
                      <div className="w-1 h-1 rounded-full bg-[var(--forge-purple)]" />
                      <div className="w-1 h-1 rounded-full bg-[var(--forge-purple)]" />
                    </>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && events[selectedDay] && (
        <div className="mt-3 pt-3 border-t border-[var(--forge-border)]">
          <div className="text-[11px] text-[var(--forge-text-tertiary)] mb-2">
            {new Date(selectedDay).toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="flex flex-col gap-1.5">
            {events[selectedDay].map((event, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span>{typeEmoji[event.type]}</span>
                <span className={`truncate ${event.done ? 'line-through text-[var(--forge-text-muted)]' : 'text-[var(--forge-text-primary)]'}`}>
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
