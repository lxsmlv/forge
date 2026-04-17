'use client';

import { useState, useTransition, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, MoreVertical, Edit3, Dumbbell, Car, Flame, Trophy, Share2, Flag, Bookmark, Eye, ChevronLeft, ChevronRight, Repeat2, Pin, BadgeCheck } from 'lucide-react';
import { toggleLike, deletePost, updatePost, toggleBookmark, incrementViews, repostPost, reactToPost, pinPost } from './actions';
import { CommentsSheet } from './CommentsSheet';
import { PollView } from '@/features/polls/PollView';
import { useImageZoom } from './ImageZoom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { renderTextWithLinks } from '@/lib/hashtags';
import { toast } from 'sonner';
import { useT } from '@/lib/useT';

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
  is_bookmarked?: boolean;
  views_count?: number;
  location?: string;
  is_pinned?: boolean;
  is_verified?: boolean;
  is_own?: boolean;
}

export function PostCard({ post, onDeleted }: { post: PostProps; onDeleted?: () => void }) {
  const t = useT();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [caption, setCaption] = useState(post.caption);
  const [category, setCategory] = useState(post.category);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked || false);
  const [showReactions, setShowReactions] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const lastTapRef = { current: 0 };
  const { openZoom, ZoomOverlay } = useImageZoom();

  const allImages = [post.image_url, ...extraImages];

  useEffect(() => {
    const { createClient } = require('@/lib/supabase/client');
    const supabase = createClient();
    supabase
      .from('post_images')
      .select('image_url, sort_order')
      .eq('post_id', post.id)
      .order('sort_order')
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          setExtraImages(data.map((d: any) => d.image_url).filter((url: string) => url !== post.image_url));
        }
      });
  }, [post.id, post.image_url]);
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
      <div className="forge-card">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={`/profile/${post.author.username}`} className="forge-avatar forge-press h-10 w-10 rounded-full bg-purple-600/15 flex items-center justify-center text-sm font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </Link>
          <Link href={`/profile/${post.author.username}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <p className="text-[14px] font-semibold text-[var(--forge-text-primary)] flex items-center gap-1 truncate">
              {post.author.full_name}
              {post.is_verified && <BadgeCheck className="w-4 h-4 text-[var(--forge-purple-bright)] fill-[var(--forge-purple-glow)] shrink-0" />}
            </p>
            <p className="text-[11px] text-[var(--forge-text-tertiary)] truncate">
              @{post.author.username} · {post.created_at}
              {post.location && <span className="ml-1">📍 {post.location}</span>}
            </p>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <span className="forge-badge forge-badge-purple uppercase" style={{ letterSpacing: '0.08em' }}>
              {category}
            </span>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] transition-colors p-1 -m-1">
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="forge-glass absolute right-0 top-8 rounded-[var(--forge-radius-md)] shadow-[var(--forge-shadow-lg)] z-10 py-1 min-w-[140px] overflow-hidden">
                  {post.is_own && (
                    <button
                      onClick={() => { setShowMenu(false); setEditing(true); setEditCaption(caption); setEditCategory(category); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] hover:bg-[var(--forge-card-hover)] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" /> {t('common.edit')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      startTransition(async () => {
                        await repostPost(post.id);
                        toast(t('common.repost'));
                        onDeleted?.();
                      });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] hover:bg-[var(--forge-card-hover)] transition-colors"
                  >
                    <Repeat2 className="w-4 h-4" /> {t('common.repost')}
                  </button>
                  {post.is_own && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        startTransition(() => { pinPost(post.id); });
                        toast(post.is_pinned ? t('common.unpin') : t('common.pin'));
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] hover:bg-[var(--forge-card-hover)] transition-colors"
                    >
                      <Pin className="w-4 h-4" /> {post.is_pinned ? t('common.unpin') : t('common.pin')}
                    </button>
                  )}
                  {post.is_own && (
                    <button
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--forge-error)] hover:bg-[var(--forge-card-hover)] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> {t('common.delete')}
                    </button>
                  )}
                  {!post.is_own && (
                    <button
                      onClick={async () => {
                        setShowMenu(false);
                        const { createClient } = await import('@/lib/supabase/client');
                        const supabase = createClient();
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                          await supabase.from('reports').insert({
                            reporter_id: user.id,
                            post_id: post.id,
                            reason: 'inappropriate content',
                          });
                          toast(t('common.report'));
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] hover:bg-[var(--forge-card-hover)] transition-colors"
                    >
                      <Flag className="w-4 h-4" /> {t('common.report')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="relative aspect-[4/3] bg-[var(--forge-surface)] select-none"
          onClick={() => {
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
              if (!liked) handleLike();
              setShowHeartAnim(true);
              setTimeout(() => setShowHeartAnim(false), 800);
              lastTapRef.current = 0;
            } else {
              lastTapRef.current = now;
              setTimeout(() => {
                if (lastTapRef.current === now && !/\.(mp4|mov|webm)/i.test(allImages[currentImg])) {
                  openZoom(allImages[currentImg]);
                }
              }, 300);
            }
          }}
        >
          {/\.(mp4|mov|webm)(\?|$)/i.test(allImages[currentImg]) ? (
            <video
              src={allImages[currentImg]}
              className="w-full h-full object-cover"
              controls
              playsInline
              muted
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img src={allImages[currentImg]} alt={caption} className="w-full h-full object-cover" draggable={false} loading="lazy" />
          )}

          {allImages.length > 1 && (
            <>
              {currentImg > 0 && (
                <button onClick={(e) => { e.stopPropagation(); setCurrentImg(currentImg - 1); }} className="forge-glass forge-press absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center hover:bg-[var(--forge-card-hover)]">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
              )}
              {currentImg < allImages.length - 1 && (
                <button onClick={(e) => { e.stopPropagation(); setCurrentImg(currentImg + 1); }} className="forge-glass forge-press absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center hover:bg-[var(--forge-card-hover)]">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              )}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentImg
                        ? 'bg-[var(--forge-purple-bright)] w-4 shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                        : 'bg-white/30 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-24 h-24 fill-[var(--forge-purple)] text-[var(--forge-purple)] forge-heart-pop drop-shadow-[0_0_24px_rgba(139,92,246,0.6)]" />
            </div>
          )}
        </div>

        <PollView postId={post.id} />

        <div className="px-4 py-3 flex items-center gap-5">
          <div className="relative">
            <button
              onClick={handleLike}
              onContextMenu={(e) => { e.preventDefault(); setShowReactions(!showReactions); }}
              disabled={isPending}
              className="forge-press flex items-center gap-1.5 group"
            >
              <Heart className={`w-[22px] h-[22px] transition-all duration-200 ${liked ? 'fill-[var(--forge-purple)] text-[var(--forge-purple)] scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'text-[var(--forge-text-secondary)] group-hover:text-[var(--forge-purple-bright)]'}`} />
              <span className={`text-[13px] tabular-nums ${liked ? 'text-[var(--forge-purple-bright)] font-medium' : 'text-[var(--forge-text-secondary)]'}`}>{likesCount}</span>
            </button>
            {showReactions && (
              <div className="forge-glass absolute bottom-9 left-0 rounded-full px-2 py-1.5 flex gap-1 z-10 shadow-[var(--forge-shadow-lg)]">
                {['🔥', '💪', '🏆', '💜', '😎', '👊'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setShowReactions(false);
                      startTransition(() => { reactToPost(post.id, emoji); });
                    }}
                    className="text-lg hover:scale-125 active:scale-95 transition-transform px-0.5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setShowComments(true)} className="forge-press flex items-center gap-1.5 group">
            <MessageCircle className="w-[22px] h-[22px] text-[var(--forge-text-secondary)] group-hover:text-[var(--forge-purple-bright)] transition-colors" />
            <span className="text-[13px] text-[var(--forge-text-secondary)] tabular-nums">{commentsCount}</span>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            {post.views_count !== undefined && post.views_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--forge-text-tertiary)] tabular-nums">
                <Eye className="w-3.5 h-3.5" />{post.views_count}
              </span>
            )}
            <button
              onClick={() => {
                setBookmarked(!bookmarked);
                startTransition(() => { toggleBookmark(post.id); });
              }}
              className="forge-press group"
            >
              <Bookmark className={`w-[18px] h-[18px] transition-all ${bookmarked ? 'fill-[var(--forge-purple)] text-[var(--forge-purple)]' : 'text-[var(--forge-text-tertiary)] group-hover:text-[var(--forge-purple-bright)]'}`} />
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/post/${post.id}`;
                navigator.clipboard.writeText(url);
                toast('Link copied');
              }}
              className="forge-press group"
            >
              <Share2 className="w-[18px] h-[18px] text-[var(--forge-text-tertiary)] group-hover:text-[var(--forge-purple-bright)] transition-colors" />
            </button>
          </div>
        </div>

        {/* Caption */}
        {!editing && caption && (
          <div className="px-4 pb-4">
            <p className="text-[14px] leading-relaxed text-[var(--forge-text-primary)]">
              <Link href={`/profile/${post.author.username}`} className="font-semibold mr-1.5 hover:text-[var(--forge-purple-bright)] transition-colors">
                @{post.author.username}
              </Link>
              {renderTextWithLinks(caption).map((part, i) =>
                part.type === 'hashtag' ? (
                  <Link key={i} href={`/hashtag/${part.value.slice(1)}`} className="text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors">
                    {part.value}
                  </Link>
                ) : part.type === 'mention' ? (
                  <Link key={i} href={`/profile/${part.value.slice(1)}`} className="text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors">
                    {part.value}
                  </Link>
                ) : (
                  <span key={i}>{part.value}</span>
                )
              )}
            </p>
          </div>
        )}

        {/* Edit mode */}
        {editing ? (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <Textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              rows={2}
              autoFocus
              className="forge-input resize-none"
            />
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = editCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setEditCategory(cat.id)}
                    className={`forge-badge forge-badge-interactive ${active ? 'forge-badge-purple' : ''}`}
                  >
                    <Icon className="w-3 h-3" />{cat.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="forge-btn-primary text-[13px] py-2 px-4">Save</button>
              <button onClick={() => setEditing(false)} className="forge-btn-secondary text-[13px] py-2 px-4">Cancel</button>
            </div>
          </div>
        ) : null}
      </div>

      <ZoomOverlay />

      {showComments && (
        <CommentsSheet postId={post.id} onClose={(newCount) => {
          setShowComments(false);
          if (typeof newCount === 'number') setCommentsCount(newCount);
        }} />
      )}
    </>
  );
}
