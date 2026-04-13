'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getNotifications, markAllRead } from '@/features/notifications/actions';

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

const MESSAGES = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
};

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
      markAllRead();
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">Notifications</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-zinc-600">
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => {
              const Icon = ICONS[n.type as keyof typeof ICONS];
              const message = MESSAGES[n.type as keyof typeof MESSAGES];
              const initials = n.actor.full_name.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2);

              return (
                <Link
                  key={n.id}
                  href={n.post_id ? `/feed` : `/profile/${n.actor.username}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
                    n.is_read
                      ? 'bg-zinc-950 border-zinc-800/30'
                      : 'bg-purple-600/5 border-purple-600/20'
                  } hover:border-purple-600/30`}
                >
                  <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-400 overflow-hidden shrink-0">
                    {n.actor.avatar_url ? (
                      <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300">
                      <span className="font-semibold text-white">@{n.actor.username}</span>{' '}
                      {message}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{n.created_at}</p>
                  </div>
                  <Icon className={`w-4 h-4 shrink-0 ${n.type === 'like' ? 'text-purple-400' : 'text-zinc-600'}`} />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
