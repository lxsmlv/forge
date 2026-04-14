'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPoll(postId: string, question: string, options: string[]) {
  const supabase = await createClient();

  const { data: poll } = await supabase
    .from('polls')
    .insert({ post_id: postId, question })
    .select('id')
    .single();

  if (!poll) return;

  const optionRows = options.map((text, i) => ({
    poll_id: poll.id,
    text,
    sort_order: i,
  }));

  await supabase.from('poll_options').insert(optionRows);
}

export async function getPoll(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: poll } = await supabase
    .from('polls')
    .select('id, question')
    .eq('post_id', postId)
    .maybeSingle();

  if (!poll) return null;

  const { data: options } = await supabase
    .from('poll_options')
    .select('id, text, sort_order')
    .eq('poll_id', poll.id)
    .order('sort_order');

  const { data: votes } = await supabase
    .from('poll_votes')
    .select('option_id, user_id')
    .eq('poll_id', poll.id);

  const totalVotes = votes?.length || 0;
  const myVote = user ? votes?.find((v) => v.user_id === user.id)?.option_id : null;

  const optionsWithVotes = (options || []).map((opt) => ({
    ...opt,
    votes: votes?.filter((v) => v.option_id === opt.id).length || 0,
    percentage: totalVotes > 0 ? Math.round(((votes?.filter((v) => v.option_id === opt.id).length || 0) / totalVotes) * 100) : 0,
  }));

  return { ...poll, options: optionsWithVotes, total_votes: totalVotes, my_vote: myVote };
}

export async function votePoll(pollId: string, optionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('poll_votes').upsert(
    { poll_id: pollId, option_id: optionId, user_id: user.id },
    { onConflict: 'poll_id,user_id' }
  );

  revalidatePath('/feed');
}
