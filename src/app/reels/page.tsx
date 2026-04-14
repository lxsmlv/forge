'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { getReels } from '@/features/reels/actions';
import { toggleLike } from '@/features/feed/actions';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getReels().then((data) => {
      setReels(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-600 pb-20">
        <p className="text-sm">No reels yet</p>
        <p className="text-xs text-zinc-700 mt-1">Upload a video post to see it here</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-16">
      <div
        ref={containerRef}
        className="snap-y snap-mandatory h-screen overflow-y-scroll"
        style={{ scrollbarWidth: 'none' }}
      >
        {reels.map((reel, index) => (
          <ReelItem
            key={reel.id}
            reel={reel}
            isActive={index === current}
            muted={muted}
            onMuteToggle={() => setMuted(!muted)}
            onVisible={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

function ReelItem({ reel, isActive, muted, onMuteToggle, onVisible }: {
  reel: any; isActive: boolean; muted: boolean; onMuteToggle: () => void; onVisible: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(reel.is_liked);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onVisible();
        videoRef.current?.play().catch(() => {});
      } else {
        videoRef.current?.pause();
      }
    }, { threshold: 0.7 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    startTransition(() => { toggleLike(reel.id); });
  };

  const initials = reel.author.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div ref={observerRef} className="snap-start h-screen w-full relative bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={reel.video_url}
        className="h-full w-full object-contain"
        loop
        playsInline
        muted={muted}
        onClick={onMuteToggle}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        <button onClick={handleLike} disabled={isPending} className="flex flex-col items-center gap-1">
          <Heart className={`w-7 h-7 ${liked ? 'fill-purple-500 text-purple-500' : 'text-white'}`} />
          <span className="text-xs text-white">{likesCount}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-xs text-white">{reel.comments_count}</span>
        </button>
        <button onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/post/${reel.id}`);
          toast('Link copied');
        }} className="flex flex-col items-center gap-1">
          <Share2 className="w-6 h-6 text-white" />
        </button>
        <button onClick={onMuteToggle}>
          {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute left-4 bottom-24 right-16">
        <Link href={`/profile/${reel.author.username}`} className="flex items-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-full bg-purple-600/30 border border-purple-600/50 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
            {reel.author.avatar_url ? <img src={reel.author.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
          </div>
          <span className="text-sm font-semibold text-white">@{reel.author.username}</span>
          {reel.author.is_verified && <span className="text-purple-400 text-sm">✓</span>}
        </Link>
        {reel.caption && <p className="text-sm text-white/90 line-clamp-2">{reel.caption}</p>}
      </div>
    </div>
  );
}
