'use client';

import { useState, useEffect, useTransition } from 'react';
import { NoteCard } from './NoteCard';
import { WorkoutCard } from './WorkoutCard';
import { getNotes, createNote, toggleNote, deleteNote, getWorkouts, createWorkout } from './actions';
import { Plus, StickyNote, Dumbbell } from 'lucide-react';
import { useT } from '@/lib/useT';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const WORKOUT_TYPES = ['gym', 'tennis', 'padel', 'running', 'other'] as const;
const NOTE_CATEGORIES = ['general', 'gym', 'car', 'personal'] as const;

export function Cabinet() {
  const [activeSection, setActiveSection] = useState<'notes' | 'workouts'>('notes');
  const [notes, setNotes] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [noteFilter, setNoteFilter] = useState<string | null>(null);
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Add note form
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', text: '', category: 'general' });

  // Add workout form
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ type: 'gym', duration: '', notes: '' });

  useEffect(() => {
    Promise.all([getNotes(), getWorkouts()]).then(([n, w]) => {
      setNotes(n);
      setWorkouts(w);
      setLoading(false);
    });
  }, []);

  const handleAddNote = () => {
    if (!newNote.title.trim()) return;
    startTransition(async () => {
      await createNote(newNote.title, newNote.text, newNote.category);
      const updated = await getNotes();
      setNotes(updated);
      setNewNote({ title: '', text: '', category: 'general' });
      setShowAddNote(false);
    });
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
    startTransition(async () => {
      await deleteNote(noteId);
    });
  };

  const handleAddWorkout = () => {
    const dur = parseInt(newWorkout.duration);
    if (!dur || dur <= 0) return;
    startTransition(async () => {
      await createWorkout(newWorkout.type, dur, newWorkout.notes);
      const updated = await getWorkouts();
      setWorkouts(updated);
      setNewWorkout({ type: 'gym', duration: '', notes: '' });
      setShowAddWorkout(false);
    });
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
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50">
        <button
          onClick={() => setActiveSection('notes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
            activeSection === 'notes'
              ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          {t('cabinet.notes')}
        </button>
        <button
          onClick={() => setActiveSection('workouts')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
            activeSection === 'workouts'
              ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          {t('cabinet.workouts')}
        </button>
      </div>

      {activeSection === 'notes' ? (
        <div className="flex flex-col gap-3">
          {!showAddNote ? (
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors py-2"
            >
              <Plus className="w-4 h-4" />
              {t('cabinet.add_note')}
            </button>
          ) : (
            <div className="bg-zinc-950 border border-purple-600/30 rounded-xl p-4 flex flex-col gap-3">
              <Input
                placeholder={t('cabinet.what_done')}
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddNote()}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
              />
              <Textarea
                placeholder={t('cabinet.details')}
                value={newNote.text}
                onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
                rows={2}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30 resize-none"
              />
              <div className="flex gap-2">
                {NOTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewNote({ ...newNote, category: cat })}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      newNote.category === cat
                        ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                        : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNote} disabled={isPending} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  {isPending ? '...' : t('common.add')}
                </Button>
                <Button onClick={() => setShowAddNote(false)} size="sm" variant="ghost" className="text-zinc-500 hover:text-white">
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-1.5 mb-2">
            {['all', ...NOTE_CATEGORIES].map((cat) => {
              const labels: Record<string, string> = { all: t('feed.all'), general: t('feed.all'), gym: t('cat.gym'), car: t('cat.cars'), personal: 'Personal' };
              return (
              <button
                key={cat}
                onClick={() => setNoteFilter(cat === 'all' ? null : cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  (cat === 'all' && !noteFilter) || noteFilter === cat
                    ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                    : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                }`}
              >
                {labels[cat] || cat}
              </button>
            );
            })}
          </div>

          {(noteFilter ? notes.filter((n) => n.category === noteFilter) : notes).length === 0 ? (
            <div className="flex flex-col items-center py-12 text-zinc-600">
              <StickyNote className="w-8 h-8 mb-2 text-zinc-700" />
              <p className="text-sm">{t('cabinet.no_notes')}</p>
            </div>
          ) : (
            (noteFilter ? notes.filter((n) => n.category === noteFilter) : notes).map((note) => (
              <NoteCard key={note.id} {...note} onToggle={handleToggleNote} onDelete={handleDeleteNote} />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {!showAddWorkout ? (
            <button
              onClick={() => setShowAddWorkout(true)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors py-2"
            >
              <Plus className="w-4 h-4" />
              {t('cabinet.log_workout')}
            </button>
          ) : (
            <div className="bg-zinc-950 border border-purple-600/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex gap-2">
                {WORKOUT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewWorkout({ ...newWorkout, type })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                      newWorkout.type === type
                        ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                        : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <Input
                type="text"
                inputMode="numeric"
                placeholder={t('cabinet.duration')}
                value={newWorkout.duration}
                onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value.replace(/\D/g, '') })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWorkout()}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
              />
              <Input
                placeholder={t('cabinet.details')}
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWorkout()}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddWorkout} disabled={isPending} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  {isPending ? '...' : t('cabinet.log_workout')}
                </Button>
                <Button onClick={() => setShowAddWorkout(false)} size="sm" variant="ghost" className="text-zinc-500 hover:text-white">
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          {workouts.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-zinc-600">
              <Dumbbell className="w-8 h-8 mb-2 text-zinc-700" />
              <p className="text-sm">{t('cabinet.no_workouts')}</p>
            </div>
          ) : (
            workouts.map((w) => (
              <WorkoutCard key={w.id} {...w} duration_min={w.duration_min} created_at={formatTimeAgo(w.created_at)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
