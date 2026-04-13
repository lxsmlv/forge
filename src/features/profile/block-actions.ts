'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleBlock(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === targetUserId) return;

  const { data: existing } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from('blocks').delete().eq('id', existing.id);
  } else {
    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetUserId });
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    await supabase.from('follows').delete().eq('follower_id', targetUserId).eq('following_id', user.id);
  }

  revalidatePath('/feed');
  revalidatePath('/profile');
}

export async function isBlocked(targetUserId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetUserId)
    .maybeSingle();

  return !!data;
}

export async function getBlockedUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('blocks')
    .select('blocked:profiles!blocked_id (id, username, full_name, avatar_url)')
    .eq('blocker_id', user.id);

  return (data || []).map((d: any) => d.blocked);
}

export async function exportUserData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: posts },
    { data: notes },
    { data: workouts },
    { data: comments },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('posts').select('*').eq('author_id', user.id),
    supabase.from('notes').select('*').eq('user_id', user.id),
    supabase.from('workouts').select('*').eq('user_id', user.id),
    supabase.from('comments').select('*').eq('author_id', user.id),
  ]);

  return { profile, posts, notes, workouts, comments, exported_at: new Date().toISOString() };
}
