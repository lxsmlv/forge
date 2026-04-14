'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PostCard } from '@/features/feed/PostCard';
import { FeedSkeleton } from '@/features/feed/PostSkeleton';
import { Cabinet } from '@/features/cabinet/Cabinet';
import { getPosts } from '@/features/feed/actions';
import { updateStreak } from '@/features/feed/streak-actions';
import { checkAndAwardAchievements } from '@/features/achievements/actions';
import { FeedHeader } from '@/features/feed/FeedHeader';
import { useT } from '@/lib/useT';
import { StoriesBar } from '@/features/stories/StoriesBar';
import { Home, PenSquare, Users, Globe, RefreshCw, Dumbbell, Car, Flame, Trophy, Bookmark } from 'lucide-react';

export default function Feed() {
  const [activeTab, setActiveTab] = useState<'feed' | 'cabinet'>('feed');
  const [feedMode, setFeedMode] = useState<'all' | 'following' | 'bookmarks' | 'trending'>('following');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const t = useT();

  const loadPosts = (mode: 'all' | 'following' | 'bookmarks' | 'trending') => {
    setLoading(true);
    setHasMore(true);
    getPosts(mode, 0, 20).then((data) => {
      setPosts(data);
      setLoading(false);
      if (data.length < 20) setHasMore(false);
    });
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    getPosts(feedMode, posts.length, 20).then((data) => {
      setPosts((prev) => [...prev, ...data]);
      setLoadingMore(false);
      if (data.length < 20) setHasMore(false);
    });
  }, [feedMode, posts.length, loadingMore, hasMore]);

  useEffect(() => {
    loadPosts(feedMode);
    updateStreak();
    checkAndAwardAchievements();
  }, [feedMode]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const filteredPosts = categoryFilter
    ? posts.filter((p) => p.category === categoryFilter)
    : posts;

  const handlePostDeleted = () => {
    loadPosts(feedMode);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <FeedHeader />

      <div className="max-w-lg mx-auto border-b border-zinc-800/30">
        <StoriesBar />
      </div>

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
            {t('feed.tab_feed')}
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
            {t('feed.tab_cabinet')}
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
                {t('feed.all')}
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
                {t('feed.following')}
              </button>
              <button
                onClick={() => setFeedMode('bookmarks')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                  feedMode === ('bookmarks')
                    ? 'border-purple-600/40 text-purple-400 bg-purple-600/10'
                    : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                {t('feed.saved')}
              </button>
              <button
                onClick={() => setFeedMode('trending')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                  feedMode === 'trending'
                    ? 'border-purple-600/40 text-purple-400 bg-purple-600/10'
                    : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                }`}
              >
                <Flame className="w-3 h-3" />
                {t('feed.trending')}
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
                  {t(`cat.${id}`)}
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
              <FeedSkeleton />
            ) : filteredPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
                ))}
                {hasMore && (
                  <div ref={observerRef} className="flex justify-center py-4">
                    {loadingMore && (
                      <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-zinc-600">
                <p className="text-lg font-medium text-zinc-500">
                  {feedMode === 'following' ? t('feed.follow_someone') : t('feed.no_posts')}
                </p>
                <p className="text-sm text-zinc-700 mt-1">
                  {feedMode === 'following' ? t('feed.switch_all') : t('feed.be_first')}
                </p>
              </div>
            )}
          </>
        ) : (
          <Cabinet />
        )}
      </main>

    </div>
  );
}
