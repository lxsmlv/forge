'use server';

import { createClient } from '@/lib/supabase/server';

export interface QuestionnaireData {
  id: string;
  client_label: string;
  answers: Record<string, string | boolean>;
  updated_at: string;
}

export async function loadQuestionnaire(id: string): Promise<QuestionnaireData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questionnaires')
    .select('id, client_label, answers, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data as QuestionnaireData;
}

export async function saveAnswers(
  id: string,
  answers: Record<string, string | boolean>,
): Promise<{ ok: boolean; updated_at?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questionnaires')
    .update({ answers, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('updated_at')
    .single();

  if (error) {
    console.error('saveAnswers error', error);
    return { ok: false };
  }
  return { ok: true, updated_at: data.updated_at };
}
