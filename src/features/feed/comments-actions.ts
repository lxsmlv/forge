'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/features/notifications/actions';
import { containsBannedWords } from '@/lib/moderation';
import { sendPush } from '@/lib/send-push';

export async function getComments(postId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, text, created_at, parent_id,
      author:profiles!author_id (username, full_name, avatar_url),
      comment_likes (user_id)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return [];

  const comments = (data || []).map((c: any) => ({
    ...c,
    created_at: formatTimeAgo(c.created_at),
    likes_count: c.comment_likes?.length || 0,
    is_liked: user ? c.comment_likes?.some((l: any) => l.user_id === user.id) : false,
    replies: [] as any[],
  }));

  const topLevel: any[] = [];
  const byId = new Map<string, any>();

  for (const c of comments) {
    byId.set(c.id, c);
  }

  for (const c of comments) {
    if (c.parent_id && byId.has(c.parent_id)) {
      byId.get(c.parent_id).replies.push(c);
    } else {
      topLevel.push(c);
    }
  }

  return topLevel;
}

export async function addComment(postId: string, text: string, parentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !text.trim()) return;
  if (containsBannedWords(text)) return;

  await supabase.from('comments').insert({
    post_id: postId,
    author_id: user.id,
    text: text.trim(),
    parent_id: parentId || null,
  });

  const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).single();
  if (post && post.author_id !== user.id) {
    await createNotification(post.author_id, 'comment', user.id, postId);
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
    sendPush(post.author_id, 'FORGE', `@${profile?.username || 'Someone'} commented on your post`, `/post/${postId}`);
  }

  revalidatePath('/feed');
}

export async function toggleCommentLike(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('comment_likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
  }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', user.id);

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
