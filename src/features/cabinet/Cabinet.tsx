'use client';

import { useState } from 'react';
import { NoteCard } from './NoteCard';
import { WorkoutCard } from './WorkoutCard';
import { Plus, StickyNote, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const INITIAL_NOTES = [
  { id: '1', title: 'Подстричься', text: '', category: 'personal' as const, is_done: false, due_date: 'Tomorrow' },
  { id: '2', title: 'Помыть машину', text: 'Koch Chemie foam + Gtechniq Crystal Serum', category: 'car' as const, is_done: false, due_date: 'Tuesday' },
  { id: '3', title: 'Сходить в зал', text: 'Chest + triceps day', category: 'gym' as const, is_done: true, due_date: 'Monday' },
  { id: '4', title: 'Побегать 5км', text: 'Park route', category: 'gym' as const, is_done: false, due_date: 'Wednesday' },
  { id: '5', title: 'Замена масла', text: '200k пробег, Mobil 1 5W-30', category: 'car' as const, is_done: false, due_date: 'This week' },
];

const INITIAL_WORKOUTS = [
  { type: 'gym', duration_min: 75, notes: 'Bench 100kg PR 🔥', created_at: 'Today' },
  { type: 'tennis', duration_min: 90, notes: 'Won 6-4 6-3', created_at: 'Yesterday' },
  { type: 'padel', duration_min: 60, notes: 'Family game', created_at: 'Sunday' },
  { type: 'running', duration_min: 35, notes: '5.2km, pace 6:40', created_at: '3 days ago' },
  { type: 'gym', duration_min: 60, notes: 'Back + biceps', created_at: '4 days ago' },
];

export function Cabinet() {
  const [activeSection, setActiveSection] = useState<'notes' | 'workouts'>('notes');
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', text: '', category: 'general' as const });

  const toggleNote = (id: string) => {
    setNotes(notes.map((n) => n.id === id ? { ...n, is_done: !n.is_done } : n));
  };

  const addNote = () => {
    if (!newNote.title.trim()) return;
    setNotes([
      { id: Date.now().toString(), ...newNote, is_done: false, due_date: null },
      ...notes,
    ]);
    setNewNote({ title: '', text: '', category: 'general' });
    setShowAddNote(false);
  };

  const CATEGORIES = ['general', 'gym', 'car', 'personal'] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Section tabs */}
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
          Notes
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
          Workouts
        </button>
      </div>

      {activeSection === 'notes' ? (
        <div className="flex flex-col gap-3">
          {/* Add note */}
          {!showAddNote ? (
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors py-2"
            >
              <Plus className="w-4 h-4" />
              Add note
            </button>
          ) : (
            <div className="bg-zinc-950 border border-purple-600/30 rounded-xl p-4 flex flex-col gap-3">
              <Input
                placeholder="What needs to be done?"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
              />
              <Textarea
                placeholder="Details (optional)"
                value={newNote.text}
                onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
                rows={2}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30 resize-none"
              />
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
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
                <Button
                  onClick={addNote}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Add
                </Button>
                <Button
                  onClick={() => setShowAddNote(false)}
                  size="sm"
                  variant="ghost"
                  className="text-zinc-500 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Notes list */}
          {notes
            .sort((a, b) => Number(a.is_done) - Number(b.is_done))
            .map((note) => (
              <NoteCard key={note.id} {...note} onToggle={toggleNote} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {INITIAL_WORKOUTS.map((w, i) => (
            <WorkoutCard key={i} {...w} />
          ))}
        </div>
      )}
    </div>
  );
}
