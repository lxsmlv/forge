'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchUsers(query: string) {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, city, car')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);

  if (error) return [];
  return data || [];
}

export async function searchPosts(query: string) {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, image_url, caption, category, created_at,
      author:profiles!author_id (username, full_name, avatar_url),
      likes (user_id),
      comments (id),
      bookmarks (user_id)
    `)
    .ilike('caption', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return [];

  return (data || []).map((post: any) => ({
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    category: post.category,
    created_at: formatTimeAgo(post.created_at),
    author: post.author,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.length || 0,
    is_liked: user ? post.likes?.some((l: any) => l.user_id === user.id) : false,
    is_bookmarked: user ? post.bookmarks?.some((b: any) => b.user_id === user.id) : false,
  }));
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
