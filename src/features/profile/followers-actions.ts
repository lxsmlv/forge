'use server';

import { createClient } from '@/lib/supabase/server';

export async function getFollowers(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('follows')
    .select('follower:profiles!follower_id (id, username, full_name, avatar_url, city, car)')
    .eq('following_id', userId);

  return (data || []).map((d: any) => d.follower);
}

export async function getFollowing(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('follows')
    .select('following:profiles!following_id (id, username, full_name, avatar_url, city, car)')
    .eq('follower_id', userId);

  return (data || []).map((d: any) => d.following);
}
