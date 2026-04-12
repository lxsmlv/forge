'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { count: postsCount },
    { count: followersCount },
    { count: followingCount },
    { count: workoutsCount },
    { data: myPosts },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('posts').select(`
      id, image_url, caption, category, created_at,
      author:profiles!author_id (username, full_name, avatar_url),
      likes (user_id),
      comments (id)
    `).eq('author_id', user.id).order('created_at', { ascending: false }),
  ]);

  if (!profile) return null;

  const posts = (myPosts || []).map((post: any) => ({
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    category: post.category,
    created_at: formatTimeAgo(post.created_at),
    author: post.author,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.length || 0,
    is_liked: post.likes?.some((l: any) => l.user_id === user.id) || false,
  }));

  return {
    ...profile,
    posts_count: postsCount || 0,
    followers_count: followersCount || 0,
    following_count: followingCount || 0,
    workouts_count: workoutsCount || 0,
    posts,
  };
}

export async function updateProfile(data: {
  bio?: string;
  city?: string;
  car?: string;
  sports?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('profiles').update(data).eq('id', user.id);
  revalidatePath('/profile');
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) return { error: 'No file' };

  const ext = file.name.split('.').pop();
  const fileName = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);

  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

  revalidatePath('/profile');
  revalidatePath('/feed');
  return { url: publicUrl };
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
