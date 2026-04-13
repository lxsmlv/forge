'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPostById(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id, image_url, caption, category, created_at,
      author:profiles!author_id (username, full_name, avatar_url),
      likes (user_id),
      comments (id)
    `)
    .eq('id', postId)
    .single();

  if (error || !post) return null;

  return {
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    category: post.category,
    created_at: formatTimeAgo(post.created_at),
    author: (post as any).author,
    likes_count: (post as any).likes?.length || 0,
    comments_count: (post as any).comments?.length || 0,
    is_liked: user ? (post as any).likes?.some((l: any) => l.user_id === user.id) : false,
  };
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
