'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getComments(postId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, text, created_at,
      author:profiles!author_id (username, full_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return [];

  return (data || []).map((c: any) => ({
    ...c,
    created_at: formatTimeAgo(c.created_at),
  }));
}

export async function addComment(postId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !text.trim()) return;

  await supabase.from('comments').insert({
    post_id: postId,
    author_id: user.id,
    text: text.trim(),
  });

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
