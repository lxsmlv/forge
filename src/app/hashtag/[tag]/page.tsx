'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Hash } from 'lucide-react';
import { PostCard } from '@/features/feed/PostCard';
import { createClient } from '@/lib/supabase/client';

export default function HashtagPage() {
  const params = useParams();
  const router = useRouter();
  const tag = params.tag as string;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: hashtag } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', tag.toLowerCase())
        .maybeSingle();

      if (!hashtag) { setLoading(false); return; }

      const { data: links } = await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtag.id);

      if (!links || links.length === 0) { setLoading(false); return; }

      const postIds = links.map((l) => l.post_id);
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id, image_url, caption, category, created_at,
          author:profiles!author_id (username, full_name, avatar_url),
          likes (user_id),
          comments (id),
          bookmarks (user_id)
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });

      const mapped = (postsData || []).map((post: any) => ({
        id: post.id,
        image_url: post.image_url,
        caption: post.caption,
        category: post.category,
        created_at: formatTimeAgo(post.created_at),
        author: post.author,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0,
        is_liked: user ? post.likes?.some((l: any) => l.user_id === user.id) : false,
        is_bookmarked: user ? post.bookmarks?.some((b: any) => b.user_id === user.id) : false,
      }));

      setPosts(mapped);
      setLoading(false);
    }
    load();
  }, [tag]);

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-[var(--forge-purple-bright)] flex items-center gap-1">
            <Hash className="w-4 h-4" />{tag}
          </span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
            <p className="text-sm text-[var(--forge-text-tertiary)]">No posts with #{tag}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
