'use server';

import { createClient } from '@/lib/supabase/server';

export async function checkAndAwardAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const [
    { count: postsCount },
    { count: followersCount },
    { count: workoutsCount },
    { data: profile },
    { data: carPosts },
    { data: existing },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('profiles').select('current_streak, max_streak').eq('id', user.id).single(),
    supabase.from('posts').select('id').eq('author_id', user.id).eq('category', 'cars').limit(1),
    supabase.from('achievements').select('type').eq('user_id', user.id),
  ]);

  const earned = new Set((existing || []).map((a) => a.type));
  const toAward: string[] = [];

  if ((postsCount || 0) >= 1 && !earned.has('first_post')) toAward.push('first_post');
  if ((postsCount || 0) >= 10 && !earned.has('ten_posts')) toAward.push('ten_posts');
  if ((followersCount || 0) >= 10 && !earned.has('ten_followers')) toAward.push('ten_followers');
  if ((workoutsCount || 0) >= 1 && !earned.has('first_workout')) toAward.push('first_workout');
  if ((workoutsCount || 0) >= 10 && !earned.has('ten_workouts')) toAward.push('ten_workouts');
  if ((carPosts || []).length > 0 && !earned.has('first_car_post')) toAward.push('first_car_post');
  if ((profile?.current_streak || 0) >= 7 && !earned.has('streak_7')) toAward.push('streak_7');
  if ((profile?.current_streak || 0) >= 30 && !earned.has('streak_30')) toAward.push('streak_30');

  if (toAward.length > 0) {
    await supabase.from('achievements').insert(
      toAward.map((type) => ({ user_id: user.id, type }))
    );
  }

  return toAward;
}

export async function getUserAchievements(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('achievements')
    .select('type, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  return data || [];
}

export async function awardFounder(userId: string) {
  const supabase = await createClient();

  await supabase.from('achievements').upsert(
    { user_id: userId, type: 'founder' },
    { onConflict: 'user_id,type' }
  );
}
