'use server';

import { createClient } from '@/lib/supabase/server';

const ADMIN_USERNAMES = ['alexforge'];

export async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  return ADMIN_USERNAMES.includes(profile?.username || '');
}

export async function getReports() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reports')
    .select(`
      id, reason, created_at,
      reporter:profiles!reporter_id (username, full_name),
      post:posts!post_id (id, caption, image_url, author:profiles!author_id (username))
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return data || [];
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: postsCount },
    { count: reportsCount },
    { count: groupsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('groups').select('*', { count: 'exact', head: true }),
  ]);

  return {
    users: usersCount || 0,
    posts: postsCount || 0,
    reports: reportsCount || 0,
    groups: groupsCount || 0,
  };
}

export async function deletePostAdmin(postId: string) {
  const supabase = await createClient();
  await supabase.from('posts').delete().eq('id', postId);
}

export async function deleteUserAdmin(userId: string) {
  const supabase = await createClient();
  await supabase.from('profiles').delete().eq('id', userId);
}
