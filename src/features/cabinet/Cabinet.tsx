'use client';

import { useState, useEffect, useTransition } from 'react';
import { NoteCard } from './NoteCard';
import { WorkoutCard } from './WorkoutCard';
import { CabinetSkeleton } from '@/features/feed/Skeletons';
import { getNotes, toggleNote, deleteNote, getWorkouts } from './actions';
import { Plus, StickyNote, Dumbbell } from 'lucide-react';
import { useT } from '@/lib/useT';
import { NoteCreateModal } from './NoteCreateModal';
import { WorkoutCreateModal } from './WorkoutCreateModal';

const DEFAULT_NOTE_CATEGORIES = ['general', 'gym', 'car', 'personal'];

interface Props {
  initialModal?: 'note' | 'workout';
  onModalClosed?: () => void;
  forcedSection?: 'notes' | 'workouts';
}

export function Cabinet({ initialModal, onModalClosed, forcedSection }: Props = {}) {
  const [activeSection, setActiveSection] = useState<'notes' | 'workouts'>(
    forcedSection || (initialModal === 'workout' ? 'workouts' : 'notes'),
  );
  const [notes, setNotes] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [noteFilter, setNoteFilter] = useState<string | null>(null);
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const [showNoteModal, setShowNoteModal] = useState(initialModal === 'note');
  const [showWorkoutModal, setShowWorkoutModal] = useState(initialModal === 'workout');

  useEffect(() => {
    Promise.all([getNotes(), getWorkouts()]).then(([n, w]) => {
      setNotes(n);
      setWorkouts(w);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setShowNoteModal(initialModal === 'note');
    setShowWorkoutModal(initialModal === 'workout');
    if (initialModal === 'workout') setActiveSection('workouts');
    if (initialModal === 'note') setActiveSection('notes');
  }, [initialModal]);

  const refreshNotes = async () => {
    const updated = await getNotes();
    setNotes(updated);
  };

  const refreshWorkouts = async () => {
    const updated = await getWorkouts();
    setWorkouts(updated);
  };

  const handleToggleNote = (noteId: string) => {
    setNotes(notes.map((n) => n.id === noteId ? { ...n, is_done: !n.is_done } : n));
    startTransition(async () => {
      await toggleNote(noteId);
      const updated = await getNotes();
      setNotes(updated);
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
    startTransition(async () => { await deleteNote(noteId); });
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <CabinetSkeleton />;
  }

  const closeNoteModal = () => {
    setShowNoteModal(false);
    onModalClosed?.();
  };

  const closeWorkoutModal = () => {
    setShowWorkoutModal(false);
    onModalClosed?.();
  };

  return (
    <div className="flex flex-col gap-4">
      {!forcedSection && (
      <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)]">
        <button
          onClick={() => setActiveSection('notes')}
          className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
            activeSection === 'notes'
              ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
              : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          {t('cabinet.notes')}
        </button>
        <button
          onClick={() => setActiveSection('workouts')}
          className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
            activeSection === 'workouts'
              ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
              : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          {t('cabinet.workouts')}
        </button>
      </div>
      )}

      {activeSection === 'notes' ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowNoteModal(true)}
            className="forge-press flex items-center gap-2 text-sm text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors py-2"
          >
            <Plus className="w-4 h-4" />
            {t('cabinet.add_note')}
          </button>

          <div className="flex gap-1.5 flex-wrap mb-2">
            {(() => {
              const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';
              const labels: Record<string, string> = { all: isRu ? 'Все' : 'All', general: isRu ? 'Общее' : 'General', gym: t('cat.gym'), car: isRu ? 'Авто' : 'Car', personal: isRu ? 'Личное' : 'Personal' };
              // Collect unique categories from actual notes
              const uniqueCats = new Set(notes.map((n) => n.category));
              const allCats = ['all', ...DEFAULT_NOTE_CATEGORIES.filter((c) => uniqueCats.has(c)), ...[...uniqueCats].filter((c) => !DEFAULT_NOTE_CATEGORIES.includes(c))];
              return allCats.map((cat) => {
                const active = (cat === 'all' && !noteFilter) || noteFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setNoteFilter(cat === 'all' ? null : cat)}
                    className={`forge-badge forge-badge-interactive ${active ? 'forge-badge-purple' : ''}`}
                  >
                    {labels[cat] || cat}
                  </button>
                );
              });
            })()}
          </div>

          {(noteFilter ? notes.filter((n) => n.category === noteFilter) : notes).length === 0 ? (
            <div className="forge-card flex flex-col items-center py-12 px-6 text-center">
              <StickyNote className="w-8 h-8 mb-2 text-[var(--forge-text-tertiary)]" />
              <p className="text-sm text-[var(--forge-text-tertiary)]">{t('cabinet.no_notes')}</p>
            </div>
          ) : (
            (noteFilter ? notes.filter((n) => n.category === noteFilter) : notes).map((note) => (
              <NoteCard
                key={note.id}
                id={note.id}
                title={note.title}
                text={note.text}
                category={note.category}
                is_done={note.is_done}
                is_task={note.is_task}
                due_date={note.due_date}
                tags={note.tags}
                pinned={note.pinned}
                onToggle={handleToggleNote}
                onDelete={handleDeleteNote}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="forge-press flex items-center gap-2 text-sm text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors py-2"
          >
            <Plus className="w-4 h-4" />
            {t('cabinet.log_workout')}
          </button>

          {workouts.length === 0 ? (
            <div className="forge-card flex flex-col items-center py-12 px-6 text-center">
              <Dumbbell className="w-8 h-8 mb-2 text-[var(--forge-text-tertiary)]" />
              <p className="text-sm text-[var(--forge-text-tertiary)]">{t('cabinet.no_workouts')}</p>
            </div>
          ) : (
            workouts.map((w) => (
              <WorkoutCard
                key={w.id}
                type={w.type}
                duration_min={w.duration_min}
                notes={w.notes}
                mood={w.mood}
                intensity={w.intensity}
                exercises={w.exercises}
                created_at={formatTimeAgo(w.created_at)}
              />
            ))
          )}
        </div>
      )}

      <NoteCreateModal open={showNoteModal} onClose={closeNoteModal} onCreated={refreshNotes} />
      <WorkoutCreateModal open={showWorkoutModal} onClose={closeWorkoutModal} onCreated={refreshWorkouts} />
    </div>
  );
}
