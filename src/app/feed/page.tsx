'use client';

import { useState } from 'react';
import { PostCard } from '@/features/feed/PostCard';
import { Cabinet } from '@/features/cabinet/Cabinet';
import { MOCK_POSTS } from '@/shared/constants/mock-data';
import { Plus, User, Home, PenSquare } from 'lucide-react';

export default function Feed() {
  const [activeTab, setActiveTab] = useState<'feed' | 'cabinet'>('feed');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <h1
            className="text-2xl tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </h1>
          <div className="flex items-center gap-2">
            <a href="/profile" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-purple-600/50 transition-colors">
              <User className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Tab switcher */}
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

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'feed' ? (
          <div className="flex flex-col gap-4">
            {MOCK_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Cabinet />
        )}
      </main>

      {/* FAB — Create post */}
      <a
        href="/create"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_40px_rgba(147,51,234,0.7)] flex items-center justify-center transition-all duration-300 active:scale-95"
      >
        <Plus className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
