'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getGroupMessages(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('group_messages')
    .select(`
      id, text, created_at,
      sender:profiles!sender_id (username, full_name, avatar_url)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(100);

  return (data || []).map((m: any) => ({
    ...m,
    is_mine: user?.id === m.sender?.id,
    time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }));
}

export async function sendGroupMessage(groupId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !text.trim()) return;

  await supabase.from('group_messages').insert({
    group_id: groupId,
    sender_id: user.id,
    text: text.trim(),
  });

  revalidatePath(`/groups/${groupId}`);
}
