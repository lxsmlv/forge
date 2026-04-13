'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, text, is_read, created_at, sender_id, receiver_id,
      sender:profiles!sender_id (username, full_name, avatar_url),
      receiver:profiles!receiver_id (username, full_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const conversations = new Map<string, any>();
  for (const msg of data) {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!conversations.has(otherId)) {
      const other = msg.sender_id === user.id ? msg.receiver : msg.sender;
      conversations.set(otherId, {
        user_id: otherId,
        username: (other as any).username,
        full_name: (other as any).full_name,
        avatar_url: (other as any).avatar_url,
        last_message: msg.text,
        last_time: formatTimeAgo(msg.created_at),
        unread: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
      });
    } else if (msg.receiver_id === user.id && !msg.is_read) {
      conversations.get(otherId).unread++;
    }
  }

  return Array.from(conversations.values());
}

export async function getMessages(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('id, text, sender_id, created_at, encrypted_key, iv')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  if (error) return [];

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  return (data || []).map((m) => ({
    ...m,
    is_mine: m.sender_id === user.id,
    time: formatTime(m.created_at),
  }));
}

export async function sendEncryptedMessage(receiverId: string, text: string, encryptedKey: string, iv: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !text.trim()) return;

  await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    text: text.trim(),
    encrypted_key: encryptedKey || null,
    iv: iv || null,
  });

  revalidatePath('/messages');
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
  return `${diffDay}d ago`;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
