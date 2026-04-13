'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ImagePlus, X, Dumbbell, Car, Flame, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<string>('lifestyle');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const ext = img.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, img.file);
      if (uploadError) { setError(uploadError.message); setLoading(false); return; }

      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }

    const { data: post, error: insertError } = await supabase.from('posts').insert({
      author_id: user.id,
      image_url: uploadedUrls[0],
      caption: caption || '',
      category: category || 'lifestyle',
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

    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">New Post</span>
          <Button
            onClick={handlePublish}
            disabled={images.length === 0 || loading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-30 disabled:shadow-none transition-all"
          >
            {loading ? '...' : 'Publish'}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {images.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-800 hover:border-purple-600/50 flex flex-col items-center justify-center gap-3 transition-colors bg-zinc-950"
          >
            <ImagePlus className="w-10 h-10 text-zinc-700" />
            <span className="text-sm text-zinc-600">Tap to add photos (up to 10)</span>
          </button>
        ) : (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <img src={images[currentImage].preview} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(currentImage)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {images.length > 1 && (
              <>
                {currentImage > 0 && (
                  <button onClick={() => setCurrentImage(currentImage - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                )}
                {currentImage < images.length - 1 && (
                  <button onClick={() => setCurrentImage(currentImage + 1)} className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentImage ? 'bg-purple-500 w-3' : 'bg-zinc-600'}`} />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-3 right-3 h-8 px-3 rounded-full bg-black/70 flex items-center gap-1.5 text-xs text-white hover:bg-black"
            >
              <ImagePlus className="w-3.5 h-3.5" /> {images.length}/10
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />

        <Textarea
          placeholder="What's the story?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30 resize-none"
        />

        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-600 uppercase tracking-wider">Category</span>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${
                    active
                      ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                      : 'bg-zinc-950 border-zinc-800/50 text-zinc-600 hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </main>
    </div>
  );
}
