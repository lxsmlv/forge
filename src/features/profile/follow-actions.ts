'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) return null;

  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', profile.id);

  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  const { count: workoutsCount } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  let is_following = false;
  let is_own = false;

  if (user) {
    is_own = user.id === profile.id;
    if (!is_own) {
      const { data: follow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .maybeSingle();
      is_following = !!follow;
    }
  }

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, image_url, caption, category, created_at,
      author:profiles!author_id (username, full_name, avatar_url),
      likes (user_id),
      comments (id)
    `)
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false });

  const formattedPosts = (posts || []).map((post: any) => ({
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    category: post.category,
    created_at: formatTimeAgo(post.created_at),
    author: post.author,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.length || 0,
    is_liked: user ? post.likes?.some((l: any) => l.user_id === user.id) : false,
  }));

  return {
    ...profile,
    posts_count: postsCount || 0,
    followers_count: followersCount || 0,
    following_count: followingCount || 0,
    workouts_count: workoutsCount || 0,
    posts: formattedPosts,
    is_following,
    is_own,
  };
}

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === targetUserId) return;

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
  }

  revalidatePath('/profile');
  revalidatePath('/feed');
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
