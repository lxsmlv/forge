'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { awardXP } from '@/features/hub/xp-actions';
import { XP_REWARDS } from '@/lib/xp';

export async function getGoals() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('is_completed', { ascending: true })
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  return data || [];
}

export async function createGoal(
  title: string,
  description: string,
  targetValue: number,
  unit: string,
  deadline: string | null,
  category: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('goals').insert({
    user_id: user.id,
    title,
    description: description || null,
    target_value: targetValue || 1,
    unit: unit || '',
    deadline: deadline || null,
    category: category || 'general',
  });

  revalidatePath('/cabinet');
}

export async function updateGoalProgress(goalId: string, increment: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: goal } = await supabase
    .from('goals')
    .select('current_value, target_value, is_completed')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single();

  if (!goal || goal.is_completed) return;

  const newValue = Math.min(goal.current_value + increment, goal.target_value);
  const completed = newValue >= goal.target_value;

  await supabase
    .from('goals')
    .update({
      current_value: newValue,
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (completed) {
    await awardXP(user.id, 25); // bonus XP for completing a goal
  }

  revalidatePath('/cabinet');
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('goals').delete().eq('id', goalId).eq('user_id', user.id);
  revalidatePath('/cabinet');
}
