'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, UserPlus, UserCheck, Search } from 'lucide-react';
import { getDiscoverProfiles } from './discover-actions';
import { toggleFollow } from '@/features/profile/follow-actions';
import { useT } from '@/lib/useT';

interface Props {
  onFirstFollow: () => void;
}

export function FeedEmptyState({ onFirstFollow }: Props) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    getDiscoverProfiles().then((data) => {
      setProfiles(data);
      setLoading(false);
    });
  }, []);

  const handleFollow = async (userId: string) => {
    if (pending.has(userId)) return;
    const isFollowed = followed.has(userId);
    setFollowed((prev) => {
      const next = new Set(prev);
      if (isFollowed) next.delete(userId);
      else next.add(userId);
      return next;
    });
    setPending((prev) => new Set(prev).add(userId));
    await toggleFollow(userId);
    setPending((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
    if (!isFollowed) onFirstFollow();
  };

  if (loading) return null;

  if (profiles.length === 0) {
    return (
      <div className="forge-card flex flex-col items-center py-16 px-6 mt-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-[var(--forge-purple-bright)]" />
        </div>
        <p className="text-[15px] font-semibold text-[var(--forge-text-primary)]">
          {t('feed.empty_start_following')}
        </p>
        <Link href="/search" className="text-[13px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] mt-2 transition-colors">
          {t('feed.empty_find_more')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)]">
          {t('feed.empty_start_following')}
        </h2>
        <Link href="/search" className="text-[12px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] flex items-center gap-1 transition-colors">
          <Search className="w-3 h-3" />
          {t('feed.empty_find_more')}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {profiles.map((profile) => {
          const isFollowed = followed.has(profile.id);
          const initials = (profile.full_name || '?')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          return (
            <div key={profile.id} className="forge-card flex items-center gap-2.5 px-3 py-2">
              <Link href={`/profile/${profile.username}`} className="forge-avatar h-8 w-8 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-xs font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </Link>
              <Link href={`/profile/${profile.username}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--forge-text-primary)] truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-[var(--forge-text-tertiary)] truncate">
                  @{profile.username}
                  {profile.city ? ` · ${profile.city}` : ''}
                  {profile.car ? ` · ${profile.car}` : ''}
                </p>
              </Link>
              <button
                onClick={() => handleFollow(profile.id)}
                disabled={pending.has(profile.id)}
                className={`forge-press shrink-0 h-7 w-7 flex items-center justify-center rounded-full transition-all disabled:opacity-50 ${
                  isFollowed
                    ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.3)]'
                    : 'bg-[var(--forge-surface)] text-[var(--forge-text-secondary)] border border-[var(--forge-border)] hover:border-[var(--forge-border-hover)]'
                }`}
              >
                {isFollowed ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
