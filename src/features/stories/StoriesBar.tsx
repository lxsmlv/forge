'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStories, createStory } from './actions';
import { useT } from '@/lib/useT';

export function StoriesBar() {
  const [groups, setGroups] = useState<any[]>([]);
  const [viewing, setViewing] = useState<{ stories: any[]; user: any; index: number } | null>(null);
  const [currentStory, setCurrentStory] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useT();

  useEffect(() => {
    getStories().then(setGroups);
  }, []);

  const handleAddStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fd.append('caption', '');
    await createStory(fd);
    const updated = await getStories();
    setGroups(updated);
  };

  const openStory = (group: any) => {
    setViewing(group);
    setCurrentStory(0);
  };

  const nextStory = useCallback(() => {
    if (!viewing) return;
    if (currentStory < viewing.stories.length - 1) {
      setCurrentStory(currentStory + 1);
    } else {
      setViewing(null);
    }
  }, [viewing, currentStory]);

  const prevStory = () => {
    if (currentStory > 0) setCurrentStory(currentStory - 1);
  };

  useEffect(() => {
    if (!viewing) return;
    const timer = setTimeout(nextStory, 5000);
    return () => clearTimeout(timer);
  }, [viewing, currentStory, nextStory]);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-3">
        {/* Add story button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="h-16 w-16 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-purple-600/50 transition-colors">
            <Plus className="w-5 h-5 text-zinc-500" />
          </div>
          <span className="text-[10px] text-zinc-600">{t('stories.your')}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAddStory} />

        {/* Story circles */}
        {groups.map((group) => {
          const initials = group.user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          return (
            <button
              key={group.user.id}
              onClick={() => openStory(group)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-br from-purple-500 to-purple-700">
                <div className="h-full w-full rounded-full bg-black p-[2px]">
                  <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {group.user.avatar_url ? (
                      <img src={group.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-purple-400">{initials}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 max-w-16 truncate">@{group.user.username}</span>
            </button>
          );
        })}
      </div>

      {/* Story viewer */}
      {viewing && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center" onClick={nextStory}>
          <div className="relative w-full max-w-lg h-full">
            {/* Progress bars */}
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
              {viewing.stories.map((_: any, i: number) => (
                <div key={i} className="flex-1 h-0.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${i < currentStory ? 'bg-white w-full' : i === currentStory ? 'bg-white w-full animate-story-progress' : 'w-0'}`} />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-400 overflow-hidden">
                  {viewing.user.avatar_url ? (
                    <img src={viewing.user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    viewing.user.full_name[0]
                  )}
                </div>
                <span className="text-sm font-medium text-white">@{viewing.user.username}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setViewing(null); }} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            <img
              src={viewing.stories[currentStory].image_url}
              alt=""
              className="w-full h-full object-contain"
            />

            {/* Caption */}
            {viewing.stories[currentStory].caption && (
              <div className="absolute bottom-20 left-4 right-4 text-center">
                <p className="text-white text-sm bg-black/50 px-3 py-2 rounded-lg inline-block">
                  {viewing.stories[currentStory].caption}
                </p>
              </div>
            )}

            {/* Reactions */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4" onClick={(e) => e.stopPropagation()}>
              {['🔥', '💪', '👊', '🏆', '💜', '😎'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    const btn = e.currentTarget;
                    btn.classList.add('scale-150');
                    setTimeout(() => btn.classList.remove('scale-150'), 200);
                  }}
                  className="text-2xl hover:scale-125 transition-transform active:scale-150"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Navigation zones */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div className="w-1/3 pointer-events-auto" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
              <div className="w-1/3" />
              <div className="w-1/3 pointer-events-auto" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
