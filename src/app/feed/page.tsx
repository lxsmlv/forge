'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PostCard } from '@/features/feed/PostCard';
import { FeedSkeleton } from '@/features/feed/Skeletons';
import { Cabinet } from '@/features/cabinet/Cabinet';
import { getPosts } from '@/features/feed/actions';
import { updateStreak } from '@/features/feed/streak-actions';
import { checkAndAwardAchievements } from '@/features/achievements/actions';
import { FeedHeader } from '@/features/feed/FeedHeader';
import { useT } from '@/lib/useT';
import { StoriesBar } from '@/features/stories/StoriesBar';
import { useRealtime } from '@/lib/useRealtime';
import { Home, PenSquare, Users, RefreshCw, Dumbbell, Car, Flame, Trophy, Bookmark } from 'lucide-react';
import { FeedEmptyState } from '@/features/feed/FeedEmptyState';
import { getMyProfile } from '@/features/profile/actions';

export default function Feed() {
  const [activeTab, setActiveTab] = useState<'feed' | 'cabinet'>('feed');
  const [feedMode, setFeedMode] = useState<'following' | 'bookmarks' | 'trending'>('following');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const t = useT();

  const loadPosts = (mode: 'following' | 'bookmarks' | 'trending') => {
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

  const [newPostsAvailable, setNewPostsAvailable] = useState(false);

  useEffect(() => {
    loadPosts(feedMode);
    updateStreak();
    checkAndAwardAchievements();
    getMyProfile().then((p) => setFollowingCount(p?.following_count ?? 0));
  }, [feedMode]);

  // Realtime — new posts appear
  useRealtime('posts', 'INSERT', useCallback(() => {
    setNewPostsAvailable(true);
  }, []));

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
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <FeedHeader />

      <div className="max-w-lg mx-auto border-b border-[var(--forge-border)]">
        <StoriesBar />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)]">
          <button
            onClick={() => setActiveTab('feed')}
            className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
                : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}
          >
            <Home className="w-4 h-4" />
            {t('feed.tab_feed')}
          </button>
          <button
            onClick={() => setActiveTab('cabinet')}
            className={`forge-press flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'cabinet'
                ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
                : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}
          >
            <PenSquare className="w-4 h-4" />
            {t('feed.tab_cabinet')}
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {newPostsAvailable && activeTab === 'feed' && (
          <button
            onClick={() => { setNewPostsAvailable(false); loadPosts(feedMode); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="forge-press w-full mb-3 py-2.5 bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.25)] rounded-[var(--forge-radius-md)] text-[13px] font-medium text-[var(--forge-purple-bright)] hover:bg-[var(--forge-purple-glow-strong)] transition-all"
          >
            ↑ New posts
          </button>
        )}

        {activeTab === 'feed' ? (
          <>
            {/* Feed mode + category filters */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {([
                { id: 'following', icon: Users, label: t('feed.following') },
                { id: 'bookmarks', icon: Bookmark, label: t('feed.saved') },
                { id: 'trending', icon: Flame, label: t('feed.trending') },
              ] as const).map(({ id, icon: Icon, label }) => {
                const active = feedMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => setFeedMode(id)}
                    className={`forge-badge forge-badge-interactive shrink-0 ${active ? 'forge-badge-purple' : ''}`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                );
              })}

              <div className="w-px h-5 bg-[var(--forge-border)] shrink-0 mx-1" />

              {[
                { id: 'gym', icon: Dumbbell },
                { id: 'cars', icon: Car },
                { id: 'lifestyle', icon: Flame },
                { id: 'sport', icon: Trophy },
              ].map(({ id, icon: Icon }) => {
                const active = categoryFilter === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCategoryFilter(categoryFilter === id ? null : id)}
                    className={`forge-badge forge-badge-interactive shrink-0 capitalize ${active ? 'forge-badge-purple' : ''}`}
                  >
                    <Icon className="w-3 h-3" />
                    {t(`cat.${id}`)}
                  </button>
                );
              })}

              <button
                onClick={() => loadPosts(feedMode)}
                className="forge-press h-7 w-7 rounded-full border border-[var(--forge-border)] bg-[var(--forge-surface)] flex items-center justify-center text-[var(--forge-text-tertiary)] hover:text-[var(--forge-purple-bright)] hover:border-[rgba(139,92,246,0.3)] transition-all shrink-0"
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
                      <div className="h-6 w-6 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                )}
              </div>
            ) : feedMode === 'following' && followingCount === 0 ? (
              <FeedEmptyState
                onFirstFollow={() => {
                  getMyProfile().then((p) => setFollowingCount(p?.following_count ?? 0));
                  loadPosts(feedMode);
                }}
              />
            ) : (
              <div className="forge-card flex flex-col items-center py-16 px-6 mt-4 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center mb-4">
                  <Flame className="w-7 h-7 text-[var(--forge-purple-bright)]" />
                </div>
                <p className="text-[15px] font-semibold text-[var(--forge-text-primary)]">
                  {feedMode === 'following' ? t('feed.follow_someone') : t('feed.no_posts')}
                </p>
                <p className="text-[13px] text-[var(--forge-text-tertiary)] mt-1.5 max-w-xs">
                  {t('feed.be_first')}
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
