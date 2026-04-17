'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProfileByUsername, toggleFollow } from '@/features/profile/follow-actions';
import { getUserAchievements } from '@/features/achievements/actions';
import { ACHIEVEMENTS } from '@/lib/achievements';
// ActivityGrid removed from public profiles
import { ProfileSkeleton } from '@/features/feed/Skeletons';
import { PostCard } from '@/features/feed/PostCard';
import { ArrowLeft, Car, Dumbbell, MapPin, UserPlus, UserCheck, MessageCircle, Ban, BadgeCheck } from 'lucide-react';
import { toggleBlock, isBlocked } from '@/features/profile/block-actions';
import { toast } from 'sonner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    getProfileByUsername(username).then((data) => {
      if (data?.is_own) {
        router.replace('/profile');
        return;
      }
      setProfile(data);
      setFollowing(data?.is_following || false);
      setFollowersCount(data?.followers_count || 0);
      if (data) {
        getUserAchievements(data.id).then(setAchievements);
        isBlocked(data.id).then(setBlocked);
      }
      setLoading(false);
    });
  }, [username, router]);

  const handleFollow = () => {
    if (!profile) return;
    setFollowing(!following);
    setFollowersCount(following ? followersCount - 1 : followersCount + 1);
    startTransition(() => {
      toggleFollow(profile.id);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
        <header className="forge-header sticky top-0 z-50">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5 min-h-[56px]">
            <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-[var(--forge-text-tertiary)]">@{username}</span>
            <div className="w-5" />
          </div>
        </header>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--forge-black)] flex flex-col items-center justify-center text-[var(--forge-text-secondary)]">
        <p>User not found</p>
        <button onClick={() => router.back()} className="mt-4 text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)]">Go back</button>
      </div>
    );
  }

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5 min-h-[56px]">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-tertiary)]">Profile</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="forge-avatar-ring">
            <div className="h-24 w-24 rounded-full bg-[var(--forge-card)] flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[var(--forge-purple-bright)]">{initials}</span>
              )}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--forge-text-primary)] flex items-center gap-1.5 justify-center tracking-tight">
              {profile.full_name}
              {profile.is_verified && <BadgeCheck className="w-5 h-5 text-[var(--forge-purple-bright)] fill-[var(--forge-purple-glow)]" />}
            </h2>
            <p className="text-[13px] text-[var(--forge-text-tertiary)] mt-0.5">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-[var(--forge-text-secondary)] mt-2 leading-relaxed">{profile.bio}</p>}
            {profile.last_online && (
              <p className="text-[11px] text-[var(--forge-text-tertiary)] mt-1.5 flex items-center gap-1.5 justify-center">
                {Date.now() - new Date(profile.last_online).getTime() < 5 * 60 * 1000 ? (
                  <><span className="h-2 w-2 rounded-full bg-[var(--forge-success)] animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" />Online now</>
                ) : (
                  <>Last seen {new Date(profile.last_online).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {profile.city && (
              <span className="forge-badge">
                <MapPin className="w-3 h-3" />{profile.city}
              </span>
            )}
            {profile.car && (
              <span className="forge-badge">
                <Car className="w-3 h-3" />{profile.car}
              </span>
            )}
          </div>

          {profile.sports?.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {profile.sports.map((sport: string) => (
                <span key={sport} className="forge-badge forge-badge-purple capitalize">
                  <Dumbbell className="w-3 h-3" />{sport}
                </span>
              ))}
            </div>
          )}

          {/* Follow + Message buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              disabled={isPending}
              className={following ? 'forge-btn-secondary px-5 py-2 text-[13px] flex items-center gap-2' : 'forge-btn-primary px-5 py-2 text-[13px] flex items-center gap-2'}
            >
              {following ? (
                <><UserCheck className="w-4 h-4" />Following</>
              ) : (
                <><UserPlus className="w-4 h-4" />Follow</>
              )}
            </button>
            <Link
              href={`/messages/${profile.id}`}
              className="forge-btn-secondary forge-press px-4 py-2 flex items-center"
            >
              <MessageCircle className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setBlocked(!blocked);
                startTransition(async () => {
                  await toggleBlock(profile.id);
                  toast(blocked ? 'Unblocked' : 'Blocked');
                });
              }}
              className={`forge-press h-[38px] px-3 rounded-[var(--forge-radius-md)] flex items-center transition-colors text-sm border ${
                blocked ? 'bg-red-900/20 text-[var(--forge-error)] border-red-900/30 hover:bg-red-900/30' : 'bg-[var(--forge-surface)] text-[var(--forge-text-tertiary)] border-[var(--forge-border)] hover:border-[var(--forge-border-hover)]'
              }`}
            >
              <Ban className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-8 mt-2 flex-wrap justify-center">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.posts_count}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Posts</span>
            </div>
            <Link href={`/profile/${username}/followers`} className="flex flex-col items-center hover:opacity-80 transition-opacity forge-press">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{followersCount}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Followers</span>
            </Link>
            <Link href={`/profile/${username}/following`} className="flex flex-col items-center hover:opacity-80 transition-opacity forge-press">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.following_count}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Following</span>
            </Link>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.workouts_count}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Workouts</span>
            </div>
            {profile.current_streak > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-[var(--forge-warning)] tabular-nums">🔥{profile.current_streak}</span>
                <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Streak</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4">
          {/* Activity moved to Hub */}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {achievements.map((a) => {
                const info = ACHIEVEMENTS[a.type];
                if (!info) return null;
                const locale = typeof window !== 'undefined' ? (localStorage.getItem('forge-locale') || 'en') : 'en';
                return (
                  <div key={a.type} className="forge-card shrink-0 px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">{info.emoji}</span>
                    <span className="text-xs font-medium text-[var(--forge-text-secondary)]">{locale === 'ru' ? info.titleRu : info.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts */}
        {profile.posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {profile.posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
            <p className="text-sm text-[var(--forge-text-tertiary)]">No posts yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
