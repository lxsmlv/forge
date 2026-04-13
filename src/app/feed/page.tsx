'use client';

import { useState, useEffect } from 'react';
import { PostCard } from '@/features/feed/PostCard';
import { Cabinet } from '@/features/cabinet/Cabinet';
import { getPosts } from '@/features/feed/actions';
import { FeedHeader } from '@/features/feed/FeedHeader';
import Link from 'next/link';
import { Plus, Home, PenSquare, Users, Globe, RefreshCw, Dumbbell, Car, Flame, Trophy } from 'lucide-react';

export default function Feed() {
  const [activeTab, setActiveTab] = useState<'feed' | 'cabinet'>('feed');
  const [feedMode, setFeedMode] = useState<'all' | 'following'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = (mode: 'all' | 'following') => {
    setLoading(true);
    getPosts(mode).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPosts(feedMode);
  }, [feedMode]);

  const filteredPosts = categoryFilter
    ? posts.filter((p) => p.category === categoryFilter)
    : posts;

  const handlePostDeleted = () => {
    loadPosts(feedMode);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <FeedHeader />

      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            <Home className="w-4 h-4" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('cabinet')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'cabinet'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            <PenSquare className="w-4 h-4" />
            Cabinet
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'feed' ? (
          <>
            {/* Feed mode + category filters */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFeedMode('all')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                  feedMode === 'all'
                    ? 'border-purple-600/40 text-purple-400 bg-purple-600/10'
                    : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                }`}
              >
                <Globe className="w-3 h-3" />
                All
              </button>
              <button
                onClick={() => setFeedMode('following')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                  feedMode === 'following'
                    ? 'border-purple-600/40 text-purple-400 bg-purple-600/10'
                    : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                }`}
              >
                <Users className="w-3 h-3" />
                Following
              </button>

              <div className="w-px h-5 bg-zinc-800 shrink-0" />

              {[
                { id: 'gym', icon: Dumbbell },
                { id: 'cars', icon: Car },
                { id: 'lifestyle', icon: Flame },
                { id: 'sport', icon: Trophy },
              ].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCategoryFilter(categoryFilter === id ? null : id)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all shrink-0 capitalize ${
                    categoryFilter === id
                      ? 'border-purple-600/40 text-purple-400 bg-purple-600/10'
                      : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {id}
                </button>
              ))}

              <button
                onClick={() => loadPosts(feedMode)}
                className="h-7 w-7 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-purple-400 hover:border-purple-600/40 transition-all shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-zinc-600">
                <p className="text-lg font-medium text-zinc-500">
                  {feedMode === 'following' ? 'Follow someone to see their posts' : 'No posts yet'}
                </p>
                <p className="text-sm text-zinc-700 mt-1">
                  {feedMode === 'following' ? 'Switch to All to discover people' : 'Be the first to share something'}
                </p>
              </div>
            )}
          </>
        ) : (
          <Cabinet />
        )}
      </main>

      <Link
        href="/create"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_40px_rgba(147,51,234,0.7)] flex items-center justify-center transition-all duration-300 active:scale-95"
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}
