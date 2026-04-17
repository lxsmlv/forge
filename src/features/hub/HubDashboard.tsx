'use client';

import { useState, useEffect } from 'react';
import { getHubData, type HubData } from './actions';
import { GreetingWidget } from './widgets/GreetingWidget';
import { TodayWidget } from './widgets/TodayWidget';
import { StatsWidget } from './widgets/StatsWidget';
import { RecentNotesWidget } from './widgets/RecentNotesWidget';
import { RecentWorkoutsWidget } from './widgets/RecentWorkoutsWidget';
import { BadgesWidget } from './widgets/BadgesWidget';
import { QuickAddWidget } from './widgets/QuickAddWidget';
import { ActivityWidget } from './widgets/ActivityWidget';
import { PulseWidget } from './widgets/PulseWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { WidgetManager } from './WidgetManager';
import { NoteCreateModal } from '@/features/cabinet/NoteCreateModal';
import { WorkoutCreateModal } from '@/features/cabinet/WorkoutCreateModal';
import { useAbly } from '@/lib/ably/client-provider';
import { useT } from '@/lib/useT';
import { Plus } from 'lucide-react';

const HIDEABLE_WIDGETS = ['today', 'stats', 'recent-notes', 'recent-workouts', 'badges', 'activity', 'pulse', 'calendar'];
const STORAGE_KEY = 'forge-hub-hidden';

interface Props {
  onSwitchTab: (tab: 'notes' | 'workouts') => void;
}

export function HubDashboard({ onSwitchTab }: Props) {
  const { userId } = useAbly();
  const t = useT();
  const [data, setData] = useState<HubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState<string[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHidden(JSON.parse(stored));
    getHubData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const hideWidget = (id: string) => {
    const next = [...hidden, id];
    setHidden(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const restoreWidget = (id: string) => {
    const next = hidden.filter((h) => h !== id);
    setHidden(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggleTask = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      todayTasks: data.todayTasks.map((t) => t.id === id ? { ...t, is_done: !t.is_done } : t),
    });
  };

  const refresh = () => {
    getHubData().then((d) => { if (d) setData(d); });
  };

  const visible = (id: string) => !hidden.includes(id);

  if (loading || !data) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <GreetingWidget fullName={data.profile.full_name} streak={data.profile.current_streak} xp={data.profile.xp} />

        {visible('today') && (
          <TodayWidget tasks={data.todayTasks} onToggle={toggleTask} onHide={() => hideWidget('today')} />
        )}

        {visible('stats') && (
          <StatsWidget
            workoutsCount={data.stats.workouts_count}
            notesCount={data.stats.notes_count}
            tasksDoneCount={data.stats.tasks_done_count}
            onHide={() => hideWidget('stats')}
          />
        )}

        {visible('recent-notes') && (
          <RecentNotesWidget notes={data.recentNotes} onViewAll={() => onSwitchTab('notes')} onHide={() => hideWidget('recent-notes')} />
        )}

        {visible('recent-workouts') && (
          <RecentWorkoutsWidget workouts={data.recentWorkouts} onViewAll={() => onSwitchTab('workouts')} onHide={() => hideWidget('recent-workouts')} />
        )}

        {visible('badges') && (
          <BadgesWidget achievements={data.achievements} onHide={() => hideWidget('badges')} />
        )}

        {visible('activity') && userId && (
          <ActivityWidget userId={userId} onHide={() => hideWidget('activity')} />
        )}

        {visible('pulse') && userId && (
          <PulseWidget userId={userId} onHide={() => hideWidget('pulse')} />
        )}

        {visible('calendar') && userId && (
          <CalendarWidget userId={userId} onHide={() => hideWidget('calendar')} />
        )}
      </div>

      {hidden.length > 0 && (
        <button
          onClick={() => setShowManager(true)}
          className="forge-btn-secondary w-full py-2.5 text-[12px] flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {t('hub.add_widget')}
        </button>
      )}

      <QuickAddWidget onAddNote={() => setShowNoteModal(true)} onAddWorkout={() => setShowWorkoutModal(true)} />

      <WidgetManager open={showManager} onClose={() => setShowManager(false)} hiddenWidgets={hidden} onRestore={restoreWidget} />
      <NoteCreateModal open={showNoteModal} onClose={() => setShowNoteModal(false)} onCreated={refresh} />
      <WorkoutCreateModal open={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} onCreated={refresh} />
    </div>
  );
}
