'use server';

import { createClient } from '@/lib/supabase/server';

export async function getReels(offset: number = 0, limit: number = 10) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, image_url, caption, category, created_at,
      author:profiles!author_id (username, full_name, avatar_url, is_verified),
      likes (user_id),
      comments (id)
    `)
    .ilike('image_url', '%.mp4%')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return [];

  return (data || []).map((post: any) => ({
    id: post.id,
    video_url: post.image_url,
    caption: post.caption,
    category: post.category,
    author: post.author,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.length || 0,
    is_liked: user ? post.likes?.some((l: any) => l.user_id === user.id) : false,
  }));
}
