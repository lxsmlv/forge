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

export async function leaveGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
  revalidatePath('/groups');
}
