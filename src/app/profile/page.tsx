'use client';

import { useState, useEffect, useRef } from 'react';
import { getMyProfile, updateProfile, uploadAvatar } from '@/features/profile/actions';
import { getUserAchievements } from '@/features/achievements/actions';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { useT } from '@/lib/useT';
// ActivityGrid moved to Hub (private only) — removed from public profile
import { ProfileQR } from '@/features/profile/QRCode';
import { ProfileSkeleton } from '@/features/feed/Skeletons';
import { PostCard } from '@/features/feed/PostCard';
import { Settings, Car, Dumbbell, MapPin, Edit3, Check, BadgeCheck } from 'lucide-react';
import { TopBar } from '@/features/navigation/TopBar';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ALL_SPORTS = ['gym', 'tennis', 'padel', 'running', 'other'];

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', city: '', car: '', sports: [] as string[] });
  const [activeTab, setActiveTab] = useState<'posts' | 'stats'>('posts');
  const t = useT();
  const [achievements, setAchievements] = useState<any[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyProfile().then((data) => {
      setProfile(data);
      if (data) {
        setEditForm({
          bio: data.bio || '',
          city: data.city || '',
          car: data.car || '',
          sports: data.sports || [],
        });
      }
      if (data) getUserAchievements(data.id).then(setAchievements);
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    await updateProfile(editForm);
    const updated = await getMyProfile();
    setProfile(updated);
    setEditing(false);
  };

  const toggleSport = (sport: string) => {
    setEditForm((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter((s) => s !== sport)
        : [...prev.sports, sport],
    }));
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const profileRightContent = (
    <>
      {profile && <ProfileQR username={profile.username} />}
      <Link href="/settings" className="forge-press h-9 w-9 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center hover:border-[var(--forge-border-hover)] transition-all">
        <Settings className="w-4 h-4 text-[var(--forge-text-secondary)]" strokeWidth={2} />
      </Link>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
        <TopBar rightContent={
          <Link href="/settings" className="forge-press h-9 w-9 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center hover:border-[var(--forge-border-hover)] transition-all">
            <Settings className="w-4 h-4 text-[var(--forge-text-secondary)]" strokeWidth={2} />
          </Link>
        } />
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <TopBar rightContent={profileRightContent} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <button onClick={() => avatarInputRef.current?.click()} className="relative group forge-press">
            <div className="forge-avatar-ring">
              <div className="h-24 w-24 rounded-full bg-[var(--forge-card)] flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[var(--forge-purple-bright)]">{initials}</span>
                )}
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const fd = new FormData();
            fd.append('avatar', file);
            const result = await uploadAvatar(fd);
            if (result?.url) {
              setProfile({ ...profile, avatar_url: result.url + '?t=' + Date.now() });
            }
          }} />

          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--forge-text-primary)] flex items-center gap-1.5 justify-center tracking-tight">
              {profile.full_name}
              {profile.is_verified && <BadgeCheck className="w-5 h-5 text-[var(--forge-purple-bright)] fill-[var(--forge-purple-glow)]" />}
            </h2>
            <p className="text-[13px] text-[var(--forge-text-tertiary)] mt-0.5">@{profile.username}</p>
            {!editing && profile.bio && <p className="text-sm text-[var(--forge-text-secondary)] mt-2 leading-relaxed">{profile.bio}</p>}
          </div>

          {!editing ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {profile.city && (
                  <span className="forge-badge">
                    <MapPin className="w-3 h-3" />{profile.city}
                  </span>
                )}
                {profile.car && (
                  <span className="forge-badge">
                    <Car className="w-3 h-3" />{profile.car}
                  </span>
                )}
              </div>

              {profile.sports?.length > 0 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {profile.sports.map((sport: string) => (
                    <span key={sport} className="forge-badge forge-badge-purple capitalize">
                      <Dumbbell className="w-3 h-3" />{sport}
                    </span>
                  ))}
                </div>
              )}

              <button onClick={() => setEditing(true)} className="forge-press flex items-center gap-1.5 text-[12px] text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors">
                <Edit3 className="w-3 h-3" /> {t('profile.edit')}
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col gap-4 forge-card p-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{t('profile.bio_label')}</label>
                <Input placeholder={t('onboarding.about_you')} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="forge-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{t('onboarding.city')}</label>
                <Input placeholder={t('onboarding.city')} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="forge-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{t('profile.car_label')}</label>
                <Input placeholder={t('onboarding.your_car')} value={editForm.car} onChange={(e) => setEditForm({ ...editForm, car: e.target.value })}
                  className="forge-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">{t('onboarding.what_sports')}</label>
                <div className="flex gap-1.5 flex-wrap">
                  {ALL_SPORTS.map((sport) => {
                    const active = editForm.sports.includes(sport);
                    return (
                      <button key={sport} onClick={() => toggleSport(sport)}
                        className={`forge-badge forge-badge-interactive ${active ? 'forge-badge-purple' : ''}`}>
                        {t(`cat.${sport}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveProfile} className="forge-btn-primary flex-1 text-[13px] py-2.5 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> {t('common.save')}
                </button>
                <button onClick={() => setEditing(false)} className="forge-btn-secondary flex-1 text-[13px] py-2.5">{t('common.cancel')}</button>
              </div>
            </div>
          )}

          <div className="flex gap-8 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.posts_count}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{t('profile.posts')}</span>
            </div>
            <Link href={`/profile/${profile.username}/followers`} className="flex flex-col items-center hover:opacity-80 transition-opacity forge-press">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.followers_count}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{t('profile.followers')}</span>
            </Link>
            <Link href={`/profile/${profile.username}/following`} className="flex flex-col items-center hover:opacity-80 transition-opacity forge-press">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.following_count}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{t('profile.following_tab')}</span>
            </Link>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.workouts_count}</span>
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{t('profile.workouts')}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)] mb-4">
          <button onClick={() => setActiveTab('posts')}
            className={`forge-press flex-1 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'posts' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]' : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}>{t('profile.posts')}</button>
          <button onClick={() => setActiveTab('stats')}
            className={`forge-press flex-1 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'stats' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]' : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}>{t('profile.activity')}</button>
        </div>

        {activeTab === 'posts' ? (
          profile.posts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {profile.posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
              <p className="text-sm text-[var(--forge-text-tertiary)]">{t('profile.no_posts')}</p>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="forge-card p-4 flex flex-col items-center gap-1">
                <Dumbbell className="w-5 h-5 text-[var(--forge-purple-bright)] mb-1" />
                <span className="text-2xl font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.workouts_count}</span>
                <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{t('profile.workouts')}</span>
              </div>
              <div className="forge-card p-4 flex flex-col items-center gap-1">
                <Car className="w-5 h-5 text-[var(--forge-purple-bright)] mb-1" />
                <span className="text-2xl font-bold text-[var(--forge-text-primary)] tabular-nums">{profile.posts_count}</span>
                <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{t('profile.posts')}</span>
              </div>
            </div>

            {/* Activity moved to Hub — private only */}

            {achievements.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[var(--forge-text-secondary)] mb-3 uppercase tracking-wider">{t('profile.achievements')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((a) => {
                    const info = ACHIEVEMENTS[a.type];
                    if (!info) return null;
                    const locale = typeof window !== 'undefined' ? (localStorage.getItem('forge-locale') || 'en') : 'en';
                    const isRu = locale === 'ru';
                    return (
                      <div key={a.type} className="forge-card p-3 flex items-center gap-3">
                        <span className="text-2xl">{info.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold text-[var(--forge-text-primary)]">{isRu ? info.titleRu : info.title}</p>
                          <p className="text-[10px] text-[var(--forge-text-tertiary)] mt-0.5">{isRu ? info.descriptionRu : info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
