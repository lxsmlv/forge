'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stories')
    .select(`
      id, image_url, caption, created_at,
      author:profiles!author_id (id, username, full_name, avatar_url)
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) return [];

  const grouped = new Map<string, any>();
  for (const story of data || []) {
    const author = (story as any).author;
    if (!grouped.has(author.id)) {
      grouped.set(author.id, {
        user: author,
        stories: [],
      });
    }
    grouped.get(author.id).stories.push({
      id: story.id,
      image_url: story.image_url,
      caption: story.caption,
      created_at: story.created_at,
    });
  }

  return Array.from(grouped.values());
}

export async function createStory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('image') as File;
  const caption = formData.get('caption') as string;
  if (!file || file.size === 0) return { error: 'Image required' };

  const ext = file.name.split('.').pop();
  const fileName = `stories/${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, file);
  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName);

  await supabase.from('stories').insert({
    author_id: user.id,
    image_url: publicUrl,
    caption: caption || null,
  });

  revalidatePath('/feed');
  return { success: true };
}
