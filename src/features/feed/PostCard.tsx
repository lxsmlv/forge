'use client';

import { useState, useTransition } from 'react';
import { Heart, MessageCircle, Trash2, MoreVertical, Edit3, Dumbbell, Car, Flame, Trophy, Share2 } from 'lucide-react';
import { toggleLike, deletePost, updatePost } from './actions';
import { CommentsSheet } from './CommentsSheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'lifestyle', label: 'Lifestyle', icon: Flame },
  { id: 'sport', label: 'Sport', icon: Trophy },
] as const;

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
  const [caption, setCaption] = useState(post.caption);
  const [category, setCategory] = useState(post.category);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTapRef = { current: 0 };
  const [editCaption, setEditCaption] = useState(post.caption);
  const [editCategory, setEditCategory] = useState(post.category);
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

  const handleSaveEdit = () => {
    setCaption(editCaption);
    setCategory(editCategory);
    setEditing(false);
    startTransition(() => { updatePost(post.id, editCaption, editCategory); });
  };

  const initials = post.author.full_name
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={`/profile/${post.author.username}`} className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-400 hover:border-purple-500 transition-colors overflow-hidden">
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </Link>
          <Link href={`/profile/${post.author.username}`} className="flex-1 hover:opacity-80 transition-opacity">
            <p className="text-sm font-semibold text-white">{post.author.full_name}</p>
            <p className="text-xs text-zinc-600">@{post.author.username} · {post.created_at}</p>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-700 bg-zinc-900 px-2 py-1 rounded-full uppercase tracking-wider">
              {category}
            </span>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-700 hover:text-zinc-400 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                  <button
                    onClick={() => { setShowMenu(false); setEditing(true); setEditCaption(caption); setEditCategory(category); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
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

        <div
          className="relative aspect-[4/3] bg-zinc-900 select-none"
          onClick={() => {
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
              if (!liked) handleLike();
              setShowHeartAnim(true);
              setTimeout(() => setShowHeartAnim(false), 800);
            }
            lastTapRef.current = now;
          }}
        >
          <img src={post.image_url} alt={caption} className="w-full h-full object-cover" draggable={false} />
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-20 h-20 fill-purple-500 text-purple-500 animate-ping" />
            </div>
          )}
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
          <button
            onClick={() => {
              const url = `${window.location.origin}/post/${post.id}`;
              navigator.clipboard.writeText(url);
            }}
            className="flex items-center gap-1.5 group ml-auto"
          >
            <Share2 className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
          </button>
        </div>

        {/* Caption or edit mode */}
        {editing ? (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <Textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              rows={2}
              autoFocus
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30 resize-none text-sm"
            />
            <div className="flex gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setEditCategory(cat.id)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${
                      editCategory === cat.id
                        ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                        : 'border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <Icon className="w-3 h-3" />{cat.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">Save</Button>
              <Button onClick={() => setEditing(false)} size="sm" variant="ghost" className="text-zinc-500 hover:text-white text-xs">Cancel</Button>
            </div>
          </div>
        ) : caption ? (
          <div className="px-4 pb-4">
            <p className="text-sm text-zinc-300">
              <span className="font-semibold text-white mr-1.5">@{post.author.username}</span>
              {caption}
            </p>
          </div>
        ) : null}
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
