'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPostById } from '@/features/feed/post-actions';
import { PostCard } from '@/features/feed/PostCard';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostById(postId).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [postId]);

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">Post</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : post ? (
          <PostCard post={post} onDeleted={() => router.push('/feed')} />
        ) : (
          <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
            <p className="text-sm text-[var(--forge-text-tertiary)]">Post not found</p>
          </div>
        )}
      </main>
    </div>
  );
}
