'use client';

import { useState } from 'react';
import { MOCK_USER, MOCK_POSTS } from '@/shared/constants/mock-data';
import { PostCard } from '@/features/feed/PostCard';
import { ArrowLeft, Settings, Car, Dumbbell, MapPin, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

const SPORT_LABELS: Record<string, string> = {
  gym: 'Gym',
  tennis: 'Tennis',
  padel: 'Padel',
  running: 'Running',
};

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'stats'>('posts');
  const user = MOCK_USER;

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const userPosts = MOCK_POSTS.filter((p) => p.author.username === user.username);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">@{user.username}</span>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-400">{initials}</span>
          </div>

          {/* Name & bio */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
            <p className="text-sm text-zinc-500 mt-1">{user.bio}</p>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {user.city && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950 border border-zinc-800/50 rounded-full px-3 py-1.5">
                <MapPin className="w-3 h-3" />
                {user.city}
              </div>
            )}
            {user.car && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950 border border-zinc-800/50 rounded-full px-3 py-1.5">
                <Car className="w-3 h-3" />
                {user.car}
              </div>
            )}
          </div>

          {/* Sports */}
          <div className="flex gap-2">
            {user.sports.map((sport) => (
              <Badge
                key={sport}
                variant="outline"
                className="border-purple-600/30 text-purple-400 bg-purple-600/10 text-xs"
              >
                <Dumbbell className="w-3 h-3 mr-1" />
                {SPORT_LABELS[sport] || sport}
              </Badge>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{userPosts.length}</span>
              <span className="text-xs text-zinc-600">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">142</span>
              <span className="text-xs text-zinc-600">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">89</span>
              <span className="text-xs text-zinc-600">Following</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">
                <Calendar className="w-4 h-4 text-zinc-500 inline" />
              </span>
              <span className="text-xs text-zinc-600">Apr 2026</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50 mb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'posts'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' ? (
          userPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-zinc-600">
              <p className="text-sm">No posts yet</p>
              <p className="text-xs text-zinc-700 mt-1">Share your first moment</p>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {/* Activity / stats summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-1">
                <Dumbbell className="w-5 h-5 text-purple-400 mb-1" />
                <span className="text-2xl font-bold text-white">47</span>
                <span className="text-xs text-zinc-600">Workouts</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-1">
                <Car className="w-5 h-5 text-purple-400 mb-1" />
                <span className="text-2xl font-bold text-white">12</span>
                <span className="text-xs text-zinc-600">Car posts</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-purple-400 mb-1" />
                <span className="text-2xl font-bold text-white">8</span>
                <span className="text-xs text-zinc-600">Connections</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-1">
                <span className="text-2xl mb-1">🔥</span>
                <span className="text-2xl font-bold text-white">23</span>
                <span className="text-xs text-zinc-600">Day streak</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
