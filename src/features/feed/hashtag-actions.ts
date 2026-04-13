'use server';

import { createClient } from '@/lib/supabase/server';

export async function getTrendingHashtags() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('hashtags')
    .select('name, posts_count')
    .order('posts_count', { ascending: false })
    .limit(10);

  return data || [];
}
