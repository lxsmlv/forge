'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/features/notifications/actions';

export async function getPosts(mode: 'all' | 'following' = 'all') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('posts')
    .select(`
      id, image_url, caption, category, created_at, author_id,
      author:profiles!author_id (username, full_name, avatar_url),
      likes (user_id),
      comments (id)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (mode === 'following' && user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = (follows || []).map((f) => f.following_id);
    followingIds.push(user.id);

    query = query.in('author_id', followingIds);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('getPosts error:', error);
    return [];
  }

  return (posts || []).map((post: any) => ({
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
}

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('likes').insert({ post_id: postId, user_id: user.id });

    const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).single();
    if (post) await createNotification(post.author_id, 'like', user.id, postId);
  }

  revalidatePath('/feed');
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('image') as File;
  const caption = formData.get('caption') as string;
  const category = formData.get('category') as string;

  if (!file || file.size === 0) return { error: 'Image required' };

  const ext = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);

  const { error: insertError } = await supabase.from('posts').insert({
    author_id: user.id,
    image_url: publicUrl,
    caption: caption || '',
    category: category || 'lifestyle',
  });

  if (insertError) return { error: insertError.message };

  revalidatePath('/feed');
  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('posts').delete().eq('id', postId).eq('author_id', user.id);
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
