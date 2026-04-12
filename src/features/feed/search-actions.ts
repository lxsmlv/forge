'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchUsers(query: string) {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, city, car')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);

  if (error) return [];
  return data || [];
}
