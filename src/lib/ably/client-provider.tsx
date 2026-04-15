'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as Ably from 'ably';
import { getAblyToken } from './token-action';

interface AblyContextValue {
  client: Ably.Realtime | null;
  userId: string | null;
}

const AblyContext = createContext<AblyContextValue>({ client: null, userId: null });

export function AblyProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!userId) return;

    const realtime = new Ably.Realtime({
      authCallback: async (_params, callback) => {
        const { token, error } = await getAblyToken();
        if (error || !token) {
          callback(error || 'no token', null);
          return;
        }
        callback(null, JSON.parse(token));
      },
      clientId: userId,
    });

    setClient(realtime);

    return () => {
      realtime.close();
      setClient(null);
    };
  }, [userId]);

  return (
    <AblyContext.Provider value={{ client, userId }}>
      {children}
    </AblyContext.Provider>
  );
}

export function useAbly() {
  return useContext(AblyContext);
}

export function useAblyEvent(event: string, handler: (data: any) => void) {
  const { client, userId } = useAbly();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!client || !userId) return;
    const channel = client.channels.get(`user:${userId}`);
    const listener = (msg: Ably.Message) => {
      handlerRef.current(msg.data);
    };
    channel.subscribe(event, listener);
    return () => {
      channel.unsubscribe(event, listener);
    };
  }, [client, userId, event]);
}
