'use client';

import { useState, useTransition } from 'react';
import { Heart, MessageCircle, Trash2, MoreVertical } from 'lucide-react';
import { toggleLike, deletePost } from './actions';
import { CommentsSheet } from './CommentsSheet';

interface PostProps {
  id: string;
  author: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  image_url: string;
  caption: string;
  category: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export function PostCard({ post, onDeleted }: { post: PostProps; onDeleted?: () => void }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    startTransition(() => { toggleLike(post.id); });
  };

  const handleDelete = () => {
    if (!confirm('Delete this post?')) return;
    startTransition(async () => {
      await deletePost(post.id);
      onDeleted?.();
    });
  };

  const initials = post.author.full_name
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <a href={`/profile/${post.author.username}`} className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-400 hover:border-purple-500 transition-colors overflow-hidden">
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </a>
          <a href={`/profile/${post.author.username}`} className="flex-1 hover:opacity-80 transition-opacity">
            <p className="text-sm font-semibold text-white">{post.author.full_name}</p>
            <p className="text-xs text-zinc-600">@{post.author.username} · {post.created_at}</p>
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-700 bg-zinc-900 px-2 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </span>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-700 hover:text-zinc-400 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] bg-zinc-900">
          <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover" />
        </div>

        <div className="px-4 py-3 flex items-center gap-5">
          <button onClick={handleLike} disabled={isPending} className="flex items-center gap-1.5 group">
            <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-purple-500 text-purple-500 scale-110' : 'text-zinc-500 group-hover:text-purple-400'}`} />
            <span className={`text-sm ${liked ? 'text-purple-400' : 'text-zinc-500'}`}>{likesCount}</span>
          </button>
          <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 group">
            <MessageCircle className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm text-zinc-500">{commentsCount}</span>
          </button>
        </div>

        {post.caption && (
          <div className="px-4 pb-4">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white mr-1.5">@{post.author.username}</span>
              {post.caption}
            </p>
          </div>
        )}
      </div>

      {showComments && (
        <CommentsSheet postId={post.id} onClose={(newCount) => {
          setShowComments(false);
          if (typeof newCount === 'number') setCommentsCount(newCount);
        }} />
      )}
    </>
  );
}
