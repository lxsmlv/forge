'use server';

import { createClient } from '@/lib/supabase/server';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { getLevel } from '@/lib/xp';

export async function checkAndAwardAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const [
    { count: postsCount },
    { count: followersCount },
    { count: workoutsCount },
    { count: notesCount },
    { count: tasksCount },
    { count: receivedLikes },
    { count: messagesCount },
    { data: profile },
    { data: existing },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_task', true).eq('is_done', true),
    supabase.from('likes').select('*, posts!inner(author_id)', { count: 'exact', head: true }).eq('posts.author_id', user.id),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', user.id),
    supabase.from('profiles').select('current_streak, max_streak, xp').eq('id', user.id).single(),
    supabase.from('achievements').select('type').eq('user_id', user.id),
  ]);

  const earned = new Set((existing || []).map((a) => a.type));
  const toAward: string[] = [];
  const posts = postsCount || 0;
  const followers = followersCount || 0;
  const workouts = workoutsCount || 0;
  const notes = notesCount || 0;
  const tasks = tasksCount || 0;
  const likes = receivedLikes || 0;
  const messages = messagesCount || 0;
  const streak = profile?.current_streak || 0;
  const level = getLevel(profile?.xp || 0);

  const check = (key: string, condition: boolean) => {
    if (condition && !earned.has(key)) toAward.push(key);
  };

  // Getting Started
  check('first_post', posts >= 1);
  check('first_workout', workouts >= 1);
  check('first_note', notes >= 1);
  check('first_message', messages >= 1);

  // Consistency
  check('streak_7', streak >= 7);
  check('ten_posts', posts >= 10);
  check('ten_workouts', workouts >= 10);
  check('ten_notes', notes >= 10);

  // Social
  check('ten_followers', followers >= 10);
  check('fifty_likes', likes >= 50);

  // Dedication
  check('streak_30', streak >= 30);
  check('fifty_posts', posts >= 50);
  check('fifty_workouts', workouts >= 50);
  check('hundred_likes', likes >= 100);

  // Mastery
  check('streak_100', streak >= 100);
  check('level_5', level >= 5);
  check('level_10', level >= 10);

  // Tasks & Goals
  check('ten_tasks_done', tasks >= 10);
  check('fifty_tasks', tasks >= 50);

  if (toAward.length > 0) {
    await supabase.from('achievements').insert(
      toAward.map((type) => ({ user_id: user.id, type }))
    );

    // Award XP bonus for each new achievement
    const xpBonus = toAward.reduce((sum, type) => sum + (ACHIEVEMENTS[type]?.xpReward || 0), 0);
    if (xpBonus > 0) {
      const currentXP = profile?.xp || 0;
      await supabase.from('profiles').update({ xp: currentXP + xpBonus }).eq('id', user.id);
    }
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
