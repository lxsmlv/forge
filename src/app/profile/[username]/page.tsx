'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProfileByUsername, toggleFollow } from '@/features/profile/follow-actions';
import { getUserAchievements } from '@/features/achievements/actions';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { PostCard } from '@/features/feed/PostCard';
import { ArrowLeft, Car, Dumbbell, MapPin, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
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

  useEffect(() => {
    getProfileByUsername(username).then((data) => {
      if (data?.is_own) {
        router.replace('/profile');
        return;
      }
      setProfile(data);
      setFollowing(data?.is_following || false);
      setFollowersCount(data?.followers_count || 0);
      if (data) getUserAchievements(data.id).then(setAchievements);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500">
        <p>User not found</p>
        <button onClick={() => router.back()} className="mt-4 text-purple-400 hover:text-purple-300">Go back</button>
      </div>
    );
  }

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">@{profile.username}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="h-24 w-24 rounded-full bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-400">{initials}</span>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
            {profile.bio && <p className="text-sm text-zinc-500 mt-1">{profile.bio}</p>}
            {profile.last_active_date && (
              <p className="text-xs text-zinc-700 mt-1">
                Last active: {new Date(profile.last_active_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {profile.city && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950 border border-zinc-800/50 rounded-full px-3 py-1.5">
                <MapPin className="w-3 h-3" />{profile.city}
              </div>
            )}
            {profile.car && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950 border border-zinc-800/50 rounded-full px-3 py-1.5">
                <Car className="w-3 h-3" />{profile.car}
              </div>
            )}
          </div>

          {profile.sports?.length > 0 && (
            <div className="flex gap-2">
              {profile.sports.map((sport: string) => (
                <Badge key={sport} variant="outline" className="border-purple-600/30 text-purple-400 bg-purple-600/10 text-xs capitalize">
                  <Dumbbell className="w-3 h-3 mr-1" />{sport}
                </Badge>
              ))}
            </div>
          )}

          {/* Follow + Message buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleFollow}
              disabled={isPending}
              className={`px-6 font-bold transition-all ${
                following
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
              }`}
            >
              {following ? (
                <><UserCheck className="w-4 h-4 mr-2" />Following</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-2" />Follow</>
              )}
            </Button>
            <Link
              href={`/messages/${profile.id}`}
              className="h-9 px-4 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-8 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{profile.posts_count}</span>
              <span className="text-xs text-zinc-600">Posts</span>
            </div>
            <Link href={`/profile/${username}/followers`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold text-white">{followersCount}</span>
              <span className="text-xs text-zinc-600">Followers</span>
            </Link>
            <Link href={`/profile/${username}/following`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold text-white">{profile.following_count}</span>
              <span className="text-xs text-zinc-600">Following</span>
            </Link>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{profile.workouts_count}</span>
              <span className="text-xs text-zinc-600">Workouts</span>
            </div>
            {profile.current_streak > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-orange-400">🔥{profile.current_streak}</span>
                <span className="text-xs text-zinc-600">Streak</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {achievements.map((a) => {
                const info = ACHIEVEMENTS[a.type];
                if (!info) return null;
                return (
                  <div key={a.type} className="shrink-0 bg-zinc-950 border border-zinc-800/50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">{info.emoji}</span>
                    <span className="text-xs font-medium text-zinc-400">{info.title}</span>
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
          <div className="flex flex-col items-center py-16 text-zinc-600">
            <p className="text-sm">No posts yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
