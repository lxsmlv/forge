'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/features/notifications/actions';
import { containsBannedWords } from '@/lib/moderation';
import { sendPush } from '@/lib/send-push';
import { extractHashtags } from '@/lib/hashtags';

export async function getPosts(mode: 'following' | 'bookmarks' | 'trending' = 'following', offset: number = 0, limit: number = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('posts')
    .select(`
      id, image_url, caption, category, created_at, author_id,
      author:profiles!author_id (username, full_name, avatar_url, is_verified),
      likes (user_id),
      comments (id),
      bookmarks (user_id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (mode === 'following' && user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = (follows || []).map((f) => f.following_id);
    followingIds.push(user.id);

    query = query.in('author_id', followingIds);
  }

  if (mode === 'bookmarks' && user) {
    const { data: bms } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', user.id);

    const postIds = (bms || []).map((b) => b.post_id);
    if (postIds.length === 0) return [];
    query = query.in('id', postIds);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('getPosts error:', error);
    return [];
  }

  let mapped = (posts || []).map((post: any) => ({
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
    is_verified: post.author?.is_verified || false,
    is_own: user ? post.author_id === user.id : false,
  }));

  if (mode === 'trending') {
    mapped = mapped.sort((a: any, b: any) => b.likes_count - a.likes_count);
  }

  return mapped;
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
    if (post && post.author_id !== user.id) {
      await createNotification(post.author_id, 'like', user.id, postId);
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      sendPush(post.author_id, 'FORGE', `@${profile?.username || 'Someone'} liked your post`, `/post/${postId}`);
      // Award XP to post author for receiving like
      const { awardXP } = await import('@/features/hub/xp-actions');
      await awardXP(post.author_id, 2);
    }
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
  if (caption && containsBannedWords(caption)) return { error: 'Post contains inappropriate language' };

  const ext = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);

  const { data: postData, error: insertError } = await supabase.from('posts').insert({
    author_id: user.id,
    image_url: publicUrl,
    caption: caption || '',
    category: category || 'lifestyle',
  }).select('id').single();

  if (insertError || !postData) return { error: insertError?.message || 'Error' };

  const tags = extractHashtags(caption || '');
  if (tags.length > 0) {
    for (const tag of tags) {
      const { data: existing } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', tag)
        .maybeSingle();

      let hashtagId: string;
      if (existing) {
        hashtagId = existing.id;
        await supabase.from('hashtags').update({ posts_count: (existing as any).posts_count + 1 }).eq('id', hashtagId);
      } else {
        const { data: newTag } = await supabase.from('hashtags').insert({ name: tag, posts_count: 1 }).select('id').single();
        if (!newTag) continue;
        hashtagId = newTag.id;
      }

      await supabase.from('post_hashtags').insert({ post_id: postData.id, hashtag_id: hashtagId });
    }
  }

  revalidatePath('/feed');
  return { success: true };
}

export async function updatePost(postId: string, caption: string, category: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('posts')
    .update({ caption, category })
    .eq('id', postId)
    .eq('author_id', user.id);

  revalidatePath('/feed');
}

export async function repostPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: original } = await supabase
    .from('posts')
    .select('image_url, caption, category')
    .eq('id', postId)
    .single();

  if (!original) return;

  await supabase.from('posts').insert({
    author_id: user.id,
    image_url: original.image_url,
    caption: original.caption,
    category: original.category,
    repost_of: postId,
  });

  revalidatePath('/feed');
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('posts').delete().eq('id', postId).eq('author_id', user.id);
  revalidatePath('/feed');
}

export async function reactToPost(postId: string, emoji: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('reactions')
    .select('id, emoji')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing && existing.emoji === emoji) {
    await supabase.from('reactions').delete().eq('id', existing.id);
  } else if (existing) {
    await supabase.from('reactions').update({ emoji }).eq('id', existing.id);
  } else {
    await supabase.from('reactions').insert({ post_id: postId, user_id: user.id, emoji });
  }

  revalidatePath('/feed');
}

export async function pinPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: post } = await supabase.from('posts').select('is_pinned').eq('id', postId).eq('author_id', user.id).single();
  if (!post) return;

  await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', postId).eq('author_id', user.id);
  revalidatePath('/feed');
  revalidatePath('/profile');
}

export async function toggleBookmark(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
  } else {
    await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath('/feed');
}

export async function incrementViews(postId: string) {
  const supabase = await createClient();
  try { await supabase.rpc('increment_views', { post_id: postId }); } catch {}
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
