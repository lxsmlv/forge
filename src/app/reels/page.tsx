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
      <div className="min-h-screen bg-[var(--forge-black)] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--forge-black)] flex flex-col items-center justify-center pb-20 px-6">
        <div className="forge-card flex flex-col items-center py-12 px-6 text-center max-w-sm">
          <p className="text-sm text-[var(--forge-text-primary)] font-semibold">No reels yet</p>
          <p className="text-xs text-[var(--forge-text-tertiary)] mt-1">Upload a video post to see it here</p>
        </div>
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
        <button onClick={handleLike} disabled={isPending} className="forge-press flex flex-col items-center gap-1">
          <Heart className={`w-7 h-7 transition-all ${liked ? 'fill-[var(--forge-purple)] text-[var(--forge-purple)] drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'}`} />
          <span className="text-xs text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tabular-nums">{likesCount}</span>
        </button>
        <button className="forge-press flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          <span className="text-xs text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tabular-nums">{reel.comments_count}</span>
        </button>
        <button onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/post/${reel.id}`);
          toast('Link copied');
        }} className="forge-press flex flex-col items-center gap-1">
          <Share2 className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
        </button>
        <button onClick={onMuteToggle} className="forge-press forge-glass h-10 w-10 rounded-full flex items-center justify-center">
          {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute left-4 bottom-24 right-16">
        <Link href={`/profile/${reel.author.username}`} className="flex items-center gap-2 mb-2">
          <div className="forge-avatar-ring">
            <div className="h-9 w-9 rounded-full bg-[var(--forge-card)] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
              {reel.author.avatar_url ? <img src={reel.author.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
          </div>
          <span className="text-sm font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">@{reel.author.username}</span>
          {reel.author.is_verified && <span className="text-[var(--forge-purple-bright)] text-sm">✓</span>}
        </Link>
        {reel.caption && <p className="text-sm text-white/95 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{reel.caption}</p>}
      </div>
    </div>
  );
}
