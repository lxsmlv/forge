'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ImagePlus, X, Dumbbell, Car, Flame, Trophy, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/compress-image';
import { useT } from '@/lib/useT';

const CATEGORIES = [
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'lifestyle', label: 'Lifestyle', icon: Flame },
  { id: 'sport', label: 'Sport', icon: Trophy },
] as const;

interface ImageItem {
  file: File;
  preview: string;
}

export default function CreatePost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('forge-draft-caption') || '';
    return '';
  });
  const [category, setCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('forge-draft-category') || 'lifestyle';
    return 'lifestyle';
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [location, setLocation] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('forge-draft-location') || '';
    return '';
  });

  useEffect(() => {
    localStorage.setItem('forge-draft-caption', caption);
    localStorage.setItem('forge-draft-category', category);
    localStorage.setItem('forge-draft-location', location);
  }, [caption, category, location]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useT();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (currentImage >= images.length - 1) setCurrentImage(Math.max(0, images.length - 2));
  };

  const handlePublish = async () => {
    if (images.length === 0) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const uploadedUrls: string[] = [];

    for (const img of images) {
      const compressed = await compressImage(img.file);
      const ext = compressed.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, compressed);
      if (uploadError) { setError(uploadError.message); setLoading(false); return; }

      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }

    const { data: post, error: insertError } = await supabase.from('posts').insert({
      author_id: user.id,
      image_url: uploadedUrls[0],
      caption: caption || '',
      category: category || 'lifestyle',
      location: location || null,
    }).select('id').single();

    if (insertError || !post) { setError(insertError?.message || 'Error'); setLoading(false); return; }

    if (uploadedUrls.length > 1) {
      const imageRows = uploadedUrls.map((url, i) => ({
        post_id: post.id,
        image_url: url,
        sort_order: i,
      }));
      await supabase.from('post_images').insert(imageRows);
    }

    localStorage.removeItem('forge-draft-caption');
    localStorage.removeItem('forge-draft-category');
    localStorage.removeItem('forge-draft-location');
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">{t('create.new_post')}</span>
          <button
            onClick={handlePublish}
            disabled={images.length === 0 || loading}
            className="forge-btn-primary text-[12px] py-2 px-4 uppercase disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ letterSpacing: '0.08em' }}
          >
            {loading ? '...' : t('create.publish')}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        {images.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-[var(--forge-radius-lg)] border-2 border-dashed border-[var(--forge-border)] hover:border-[rgba(139,92,246,0.4)] hover:bg-[var(--forge-card)] flex flex-col items-center justify-center gap-3 transition-all bg-[var(--forge-surface)]"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center">
              <ImagePlus className="w-7 h-7 text-[var(--forge-purple-bright)]" />
            </div>
            <span className="text-sm text-[var(--forge-text-secondary)]">{t('create.add_photos')}</span>
          </button>
        ) : (
          <div className="forge-card relative aspect-[4/3] overflow-hidden" style={{ padding: 0 }}>
            {images[currentImage].file.type.startsWith('video/') ? (
              <video src={images[currentImage].preview} className="w-full h-full object-cover" controls playsInline muted />
            ) : (
              <img src={images[currentImage].preview} alt="" className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => removeImage(currentImage)}
              className="forge-glass forge-press absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {images.length > 1 && (
              <>
                {currentImage > 0 && (
                  <button onClick={() => setCurrentImage(currentImage - 1)} className="forge-glass forge-press absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                )}
                {currentImage < images.length - 1 && (
                  <button onClick={() => setCurrentImage(currentImage + 1)} className="forge-glass forge-press absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImage ? 'bg-[var(--forge-purple-bright)] w-4 shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-white/30 w-1.5'}`} />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="forge-glass forge-press absolute bottom-3 right-3 h-8 px-3 rounded-full flex items-center gap-1.5 text-xs text-white"
            >
              <ImagePlus className="w-3.5 h-3.5" /> {images.length}/10
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleImageSelect} className="hidden" />

        <Textarea
          placeholder={t('create.whats_story')}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="forge-input resize-none"
        />

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--forge-text-tertiary)] pointer-events-none z-10" />
          <input
            type="text"
            placeholder={t('create.add_location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="forge-input w-full !pl-10"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{t('create.category')}</span>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`forge-press flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[var(--forge-radius-md)] border transition-all ${
                    active
                      ? 'bg-[var(--forge-purple-glow)] border-[rgba(139,92,246,0.35)] text-[var(--forge-purple-bright)]'
                      : 'bg-[var(--forge-surface)] border-[var(--forge-border)] text-[var(--forge-text-tertiary)] hover:border-[var(--forge-border-hover)] hover:text-[var(--forge-text-secondary)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-[var(--forge-error)] text-[13px] text-center">{error}</p>}
      </main>
    </div>
  );
}
