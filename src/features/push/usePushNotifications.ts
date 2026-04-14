'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') return false;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      await supabase.from('push_subscriptions').insert({
        user_id: user.id,
        subscription: subscription.toJSON(),
      });

      return true;
    } catch (err) {
      console.error('Push subscription error:', err);
      return false;
    }
  };

  return { permission, subscribe };
}
