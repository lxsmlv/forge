'use server';

import { createClient } from '@/lib/supabase/server';

export interface HubData {
  profile: { full_name: string; current_streak: number; xp: number };
  todayTasks: Array<{ id: string; title: string; is_done: boolean; due_date: string | null }>;
  stats: { workouts_count: number; notes_count: number; tasks_done_count: number };
  recentNotes: Array<{ id: string; title: string; text: string; created_at: string; is_done: boolean; category: string }>;
  recentWorkouts: Array<{ id: string; type: string; duration_min: number; created_at: string; notes: string; mood?: number | null }>;
  achievements: Array<{ type: string }>;
}

export async function getHubData(): Promise<HubData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const [profileRes, todayRes, notesCountRes, workoutsCountRes, tasksDoneRes, recentNotesRes, recentWorkoutsRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('full_name, current_streak, xp').eq('id', user.id).single(),
    supabase.from('notes').select('id, title, is_done, due_date').eq('user_id', user.id).eq('is_task', true).or(`due_date.eq.${today},due_date.is.null`).order('is_done', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_task', true).eq('is_done', true),
    supabase.from('notes').select('id, title, text, created_at, is_done, category').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('workouts').select('id, type, duration_min, created_at, notes, mood').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('user_achievements').select('type').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
  ]);

  return {
    profile: { full_name: profileRes.data?.full_name || '', current_streak: profileRes.data?.current_streak || 0, xp: profileRes.data?.xp || 0 },
    todayTasks: todayRes.data || [],
    stats: { workouts_count: workoutsCountRes.count || 0, notes_count: notesCountRes.count || 0, tasks_done_count: tasksDoneRes.count || 0 },
    recentNotes: recentNotesRes.data || [],
    recentWorkouts: recentWorkoutsRes.data || [],
    achievements: achievementsRes.data || [],
  };
}

export async function toggleTaskDone(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: note } = await supabase.from('notes').select('is_done').eq('id', noteId).eq('user_id', user.id).single();
  if (!note) return;

  const wasDone = note.is_done;
  await supabase.from('notes').update({ is_done: !wasDone }).eq('id', noteId).eq('user_id', user.id);

  // Award XP only when completing (not uncompleting)
  if (!wasDone) {
    const { awardXP } = await import('@/features/hub/xp-actions');
    const { XP_REWARDS } = await import('@/lib/xp');
    await awardXP(user.id, XP_REWARDS.task_done);
  }
}
