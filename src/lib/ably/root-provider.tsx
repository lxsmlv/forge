'use client';

import { useEffect, useState, ReactNode } from 'react';
import { AblyProvider } from './client-provider';
import { createClient } from '@/lib/supabase/client';

export function AblyRootProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  return <AblyProvider userId={userId}>{children}</AblyProvider>;
}
