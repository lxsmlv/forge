'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getGroups() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('groups')
    .select(`
      id, name, description, avatar_url, is_private, created_at,
      creator:profiles!created_by (username, full_name, avatar_url),
      group_members (user_id)
    `)
    .order('created_at', { ascending: false });

  return (data || []).map((g: any) => ({
    ...g,
    members_count: g.group_members?.length || 0,
  }));
}

export async function getGroupById(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: group } = await supabase
    .from('groups')
    .select(`
      id, name, description, avatar_url, is_private, created_at,
      creator:profiles!created_by (username, full_name, avatar_url),
      group_members (user_id)
    `)
    .eq('id', groupId)
    .single();

  if (!group) return null;

  const is_member = user ? (group as any).group_members?.some((m: any) => m.user_id === user.id) : false;

  return {
    ...group,
    members_count: (group as any).group_members?.length || 0,
    is_member,
  };
}

export async function createGroup(name: string, description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !name.trim()) return null;

  const { data: group } = await supabase
    .from('groups')
    .insert({ name: name.trim(), description: description.trim() || null, created_by: user.id })
    .select('id')
    .single();

  if (group) {
    await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'admin' });
  }

  revalidatePath('/groups');
  return group;
}

export async function joinGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id });
  revalidatePath('/groups');
}

export async function getGroupPosts(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: links } = await supabase
    .from('group_posts')
    .select('post_id')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (!links || links.length === 0) return [];

  const postIds = links.map((l) => l.post_id);
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, image_url, caption, category, created_at, location, is_pinned,
      author:profiles!author_id (username, full_name, avatar_url),
      likes (user_id),
      comments (id),
      bookmarks (user_id)
    `)
    .in('id', postIds)
    .order('created_at', { ascending: false });

  return (posts || []).map((post: any) => ({
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    category: post.category,
    created_at: formatTimeAgo(post.created_at),
    location: post.location,
    is_pinned: post.is_pinned,
    author: post.author,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.length || 0,
    is_liked: user ? post.likes?.some((l: any) => l.user_id === user.id) : false,
    is_bookmarked: user ? post.bookmarks?.some((b: any) => b.user_id === user.id) : false,
  }));
}

export async function postToGroup(groupId: string, postId: string) {
  const supabase = await createClient();
  await supabase.from('group_posts').insert({ group_id: groupId, post_id: postId });
  revalidatePath(`/groups/${groupId}`);
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

export async function leaveGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
  revalidatePath('/groups');
}
