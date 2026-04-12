'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ImagePlus, X, Dumbbell, Car, Flame, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/features/feed/actions';

const CATEGORIES = [
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'lifestyle', label: 'Lifestyle', icon: Flame },
  { id: 'sport', label: 'Sport', icon: Trophy },
] as const;

export default function CreatePost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<string>('lifestyle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePublish = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption);
    formData.append('category', category);

    const result = await createPost(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
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
            disabled={!imageFile || loading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-30 disabled:shadow-none transition-all"
          >
            {loading ? '...' : 'Publish'}
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {!imagePreview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-800 hover:border-purple-600/50 flex flex-col items-center justify-center gap-3 transition-colors bg-zinc-950"
          >
            <ImagePlus className="w-10 h-10 text-zinc-700" />
            <span className="text-sm text-zinc-600">Tap to add photo</span>
          </button>
        ) : (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

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
