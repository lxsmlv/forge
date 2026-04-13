'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDiscoverProfiles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let followingIds: string[] = [];
  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
    followingIds = (follows || []).map((f) => f.following_id);
    followingIds.push(user.id);
  }

  let query = supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, city, car, sports')
    .order('created_at', { ascending: false })
    .limit(20);

  if (followingIds.length > 0) {
    query = query.not('id', 'in', `(${followingIds.join(',')})`);
  }

  const { data } = await query;
  return data || [];
}
