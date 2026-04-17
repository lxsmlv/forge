'use server';

import { createClient } from '@/lib/supabase/server';

export async function awardXP(userId: string, amount: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('xp').eq('id', userId).single();
  const currentXP = data?.xp || 0;
  await supabase.from('profiles').update({ xp: currentXP + amount }).eq('id', userId);
}

export async function getXP(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
  return data?.xp || 0;
}
