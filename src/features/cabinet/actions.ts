'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { awardXP } from '@/features/hub/xp-actions';
import { XP_REWARDS } from '@/lib/xp';

export async function getNotes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('is_done', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function createNote(title: string, text: string, category: string, isTask: boolean = false, dueDate: string | null = null, tags?: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('notes').insert({
    user_id: user.id,
    title,
    text,
    category,
    is_task: isTask,
    due_date: dueDate || null,
    tags: tags && tags.length > 0 ? tags : null,
  });

  await awardXP(user.id, XP_REWARDS.note);
  revalidatePath('/cabinet');
}

export async function toggleNote(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: note } = await supabase
    .from('notes')
    .select('is_done')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single();

  if (!note) return;

  await supabase
    .from('notes')
    .update({ is_done: !note.is_done })
    .eq('id', noteId)
    .eq('user_id', user.id);

  revalidatePath('/feed');
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id);

  revalidatePath('/feed');
}

export async function getWorkouts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return data || [];
}

export async function createWorkout(
  type: string,
  durationMin: number,
  notes: string,
  mood?: number,
  intensity?: number,
  exercises?: Array<{ name: string }>,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('workouts').insert({
    user_id: user.id,
    type,
    duration_min: durationMin,
    notes: notes || null,
    mood: mood || null,
    intensity: intensity || null,
    exercises: exercises && exercises.length > 0 ? exercises.filter((e) => e.name.trim()) : null,
  });

  await awardXP(user.id, XP_REWARDS.workout);
  revalidatePath('/cabinet');
}
