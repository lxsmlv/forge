'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NotificationsSkeleton } from '@/features/feed/Skeletons';
import { getNotifications, markAllRead } from '@/features/notifications/actions';
import { useT } from '@/lib/useT';

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

const MESSAGES_EN = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
};

const MESSAGES_RU = {
  like: 'notifications.liked',
  comment: 'notifications.commented',
  follow: 'notifications.followed',
};

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
      markAllRead();
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">{t('notifications.title')}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <NotificationsSkeleton />
        ) : notifications.length === 0 ? (
          <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
            <p className="text-sm text-[var(--forge-text-tertiary)]">{t('notifications.none')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => {
              const Icon = ICONS[n.type as keyof typeof ICONS];
              const message = t(`notifications.${n.type === 'like' ? 'liked' : n.type === 'comment' ? 'commented' : 'followed'}`);
              const initials = n.actor.full_name.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2);

              return (
                <Link
                  key={n.id}
                  href={n.post_id ? `/feed` : `/profile/${n.actor.username}`}
                  className={`forge-card forge-card-interactive flex items-center gap-3 px-3 py-3 ${
                    !n.is_read ? 'bg-[var(--forge-purple-glow)]' : ''
                  }`}
                  style={!n.is_read ? { borderColor: 'rgba(139,92,246,0.2)' } : undefined}
                >
                  <div className="forge-avatar h-10 w-10 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-sm font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                    {n.actor.avatar_url ? (
                      <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--forge-text-secondary)]">
                      <span className="font-semibold text-[var(--forge-text-primary)]">@{n.actor.username}</span>{' '}
                      {message}
                    </p>
                    <p className="text-[11px] text-[var(--forge-text-tertiary)] mt-0.5">{n.created_at}</p>
                  </div>
                  <Icon className={`w-4 h-4 shrink-0 ${n.type === 'like' ? 'text-[var(--forge-purple-bright)]' : 'text-[var(--forge-text-tertiary)]'}`} />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
