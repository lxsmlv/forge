'use client';

import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';

interface PostProps {
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

export function PostCard({ post }: { post: PostProps }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const initials = post.author.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl overflow-hidden">
      {/* Author header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-400">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{post.author.full_name}</p>
          <p className="text-xs text-zinc-600">@{post.author.username} · {post.created_at}</p>
        </div>
        <span className="text-xs text-zinc-700 bg-zinc-900 px-2 py-1 rounded-full uppercase tracking-wider">
          {post.category}
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] bg-zinc-900">
        <img
          src={post.image_url}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-5">
        <button onClick={toggleLike} className="flex items-center gap-1.5 group">
          <Heart
            className={`w-5 h-5 transition-all ${
              liked
                ? 'fill-purple-500 text-purple-500 scale-110'
                : 'text-zinc-500 group-hover:text-purple-400'
            }`}
          />
          <span className={`text-sm ${liked ? 'text-purple-400' : 'text-zinc-500'}`}>
            {likesCount}
          </span>
        </button>
        <button className="flex items-center gap-1.5 group">
          <MessageCircle className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
          <span className="text-sm text-zinc-500">{post.comments_count}</span>
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4">
        <p className="text-sm text-zinc-300">
          <span className="font-semibold text-white mr-1.5">@{post.author.username}</span>
          {post.caption}
        </p>
      </div>
    </div>
  );
}
