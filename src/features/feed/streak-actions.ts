'use server';

import { createClient } from '@/lib/supabase/server';

export async function updateStreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try { await supabase.rpc('update_streak', { uid: user.id }); } catch {}
}

export async function getStreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { current: 0, max: 0 };

  const { data } = await supabase
    .from('profiles')
    .select('current_streak, max_streak')
    .eq('id', user.id)
    .single();

  return {
    current: data?.current_streak || 0,
    max: data?.max_streak || 0,
  };
}
