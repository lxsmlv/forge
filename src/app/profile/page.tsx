'use client';

import { useState, useEffect } from 'react';
import { getMyProfile, updateProfile } from '@/features/profile/actions';
import { PostCard } from '@/features/feed/PostCard';
import { ArrowLeft, Settings, Car, Dumbbell, MapPin, Edit3, Check, LogOut } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">@{profile.username}</span>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="h-24 w-24 rounded-full bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-400">{initials}</span>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
            {!editing && profile.bio && <p className="text-sm text-zinc-500 mt-1">{profile.bio}</p>}
          </div>

          {!editing ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {profile.city && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950 border border-zinc-800/50 rounded-full px-3 py-1.5">
                    <MapPin className="w-3 h-3" />{profile.city}
                  </div>
                )}
                {profile.car && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950 border border-zinc-800/50 rounded-full px-3 py-1.5">
                    <Car className="w-3 h-3" />{profile.car}
                  </div>
                )}
              </div>

              {profile.sports?.length > 0 && (
                <div className="flex gap-2">
                  {profile.sports.map((sport: string) => (
                    <Badge key={sport} variant="outline" className="border-purple-600/30 text-purple-400 bg-purple-600/10 text-xs capitalize">
                      <Dumbbell className="w-3 h-3 mr-1" />{sport}
                    </Badge>
                  ))}
                </div>
              )}

              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                <Edit3 className="w-3 h-3" /> Edit profile
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <Input placeholder="Bio" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30" />
              <Input placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30" />
              <Input placeholder="Car" value={editForm.car} onChange={(e) => setEditForm({ ...editForm, car: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30" />
              <div className="flex gap-2">
                {ALL_SPORTS.map((sport) => (
                  <button key={sport} onClick={() => toggleSport(sport)}
                    className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all ${
                      editForm.sports.includes(sport)
                        ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                        : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'
                    }`}>
                    {sport}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  <Check className="w-4 h-4 mr-1" /> Save
                </Button>
                <Button onClick={() => setEditing(false)} size="sm" variant="ghost" className="text-zinc-500 hover:text-white">Cancel</Button>
              </div>
            </div>
          )}

          <div className="flex gap-8 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{profile.posts_count}</span>
              <span className="text-xs text-zinc-600">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{profile.followers_count}</span>
              <span className="text-xs text-zinc-600">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{profile.following_count}</span>
              <span className="text-xs text-zinc-600">Following</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{profile.workouts_count}</span>
              <span className="text-xs text-zinc-600">Workouts</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50 mb-4">
          <button onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'posts' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}>Posts</button>
          <button onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'stats' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}>Activity</button>
        </div>

        {activeTab === 'posts' ? (
          profile.posts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {profile.posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-zinc-600">
              <p className="text-sm">No posts yet</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-1">
              <Dumbbell className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-2xl font-bold text-white">{profile.workouts_count}</span>
              <span className="text-xs text-zinc-600">Workouts</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center gap-1">
              <Car className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-2xl font-bold text-white">{profile.posts_count}</span>
              <span className="text-xs text-zinc-600">Posts</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
