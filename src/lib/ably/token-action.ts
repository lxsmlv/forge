'use server';

import Ably from 'ably';
import { createClient } from '@/lib/supabase/server';

export async function getAblyToken(): Promise<{ token: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { token: null, error: 'not authenticated' };

  const key = process.env.ABLY_ROOT_KEY;
  if (!key) return { token: null, error: 'ABLY_ROOT_KEY missing' };

  const rest = new Ably.Rest(key);
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: user.id,
    capability: JSON.stringify({ [`user:${user.id}`]: ['subscribe'] }),
    ttl: 60 * 60 * 1000,
  });

  return { token: JSON.stringify(tokenRequest) };
}
