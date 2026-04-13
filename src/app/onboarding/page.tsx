'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Camera, Dumbbell, Car } from 'lucide-react';

const ALL_SPORTS = ['gym', 'tennis', 'padel', 'running', 'other'];

export default function Onboarding() {
  const router = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [car, setCar] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSport = (s: string) => {
    setSports(sports.includes(s) ? sports.filter((x) => x !== s) : [...sports, s]);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/avatar.${ext}`;
      await supabase.storage.from('posts').upload(fileName, avatarFile, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    }

    await supabase.from('profiles').update({
      bio: bio || null,
      city: city || null,
      car: car || null,
      sports,
    }).eq('id', user.id);

    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <h1
          className="text-3xl tracking-[0.15em] text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>

        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 w-10 rounded-full transition-all ${step >= s ? 'bg-purple-600' : 'bg-zinc-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
            <p className="text-zinc-400 text-sm">Add your photo</p>
            <button onClick={() => avatarRef.current?.click()} className="relative group">
              <div className="h-28 w-28 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-zinc-600" />
                )}
              </div>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            <Textarea
              placeholder="Write something about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30 resize-none"
            />
            <Button onClick={() => setStep(2)} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
            <p className="text-zinc-400 text-sm flex items-center gap-2"><Dumbbell className="w-4 h-4" /> What sports do you do?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ALL_SPORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSport(s)}
                  className={`px-4 py-2 rounded-full border text-sm capitalize transition-all ${
                    sports.includes(s)
                      ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                      : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(3)} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
            <p className="text-zinc-400 text-sm flex items-center gap-2"><Car className="w-4 h-4" /> Tell us about your ride</p>
            <Input
              placeholder="Your car (e.g. Land Cruiser 200)"
              value={car}
              onChange={(e) => setCar(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
            />
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
            />
            <Button
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_25px_rgba(147,51,234,0.4)] disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Enter Forge'}
            </Button>
            <button onClick={handleFinish} className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
