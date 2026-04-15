'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Camera, Dumbbell, Car } from 'lucide-react';
import { useT } from '@/lib/useT';

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
  const t = useT();

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
    <div className="relative min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[var(--forge-purple)] blur-[160px] opacity-10" />
      </div>
      <div className="relative w-full max-w-md flex flex-col items-center gap-8">
        <h1
          className="text-3xl tracking-[0.15em] forge-gradient-text drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>

        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                step >= s ? 'bg-[var(--forge-purple)] w-12 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-[var(--forge-border)] w-10'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
            <p className="text-[var(--forge-text-secondary)] text-sm">{t('onboarding.add_photo')}</p>
            <button onClick={() => avatarRef.current?.click()} className="relative group forge-press">
              <div className="forge-avatar-ring">
                <div className="h-28 w-28 rounded-full bg-[var(--forge-card)] flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-[var(--forge-text-tertiary)]" />
                  )}
                </div>
              </div>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            <Textarea
              placeholder={t('onboarding.about_you')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="forge-input resize-none"
            />
            <button onClick={() => setStep(2)} className="forge-btn-primary w-full py-3 text-[14px] uppercase flex items-center justify-center gap-2" style={{ letterSpacing: '0.08em' }}>
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
            <p className="text-[var(--forge-text-secondary)] text-sm flex items-center gap-2"><Dumbbell className="w-4 h-4 text-[var(--forge-purple-bright)]" /> {t('onboarding.what_sports')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ALL_SPORTS.map((s) => {
                const active = sports.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSport(s)}
                    className={`forge-badge forge-badge-interactive capitalize ${active ? 'forge-badge-purple' : ''}`}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(3)} className="forge-btn-primary w-full py-3 text-[14px] uppercase flex items-center justify-center gap-2" style={{ letterSpacing: '0.08em' }}>
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
            <p className="text-[var(--forge-text-secondary)] text-sm flex items-center gap-2"><Car className="w-4 h-4 text-[var(--forge-purple-bright)]" /> {t('onboarding.your_car')}</p>
            <Input
              placeholder={t('onboarding.your_car')}
              value={car}
              onChange={(e) => setCar(e.target.value)}
              className="forge-input"
            />
            <Input
              placeholder={t('onboarding.city')}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="forge-input"
            />
            <button
              onClick={handleFinish}
              disabled={loading}
              className="forge-btn-primary w-full py-3 text-[14px] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ letterSpacing: '0.08em' }}
            >
              {loading ? t('onboarding.setting_up') : t('onboarding.enter')}
            </button>
            <button onClick={handleFinish} className="text-[12px] text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] transition-colors">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
