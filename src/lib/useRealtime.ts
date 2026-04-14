'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function useRealtime(
  table: string,
  event: RealtimeEvent,
  callback: (payload: any) => void,
  filter?: string,
) {
  useEffect(() => {
    const supabase = createClient();

    const channelConfig: any = {
      event,
      schema: 'public',
      table,
    };
    if (filter) channelConfig.filter = filter;

    const channel = supabase
      .channel(`realtime-${table}-${event}-${filter || 'all'}-${Date.now()}`)
      .on('postgres_changes', channelConfig, callback)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, event, callback, filter]);
}
