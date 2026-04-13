'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { generateKeyPair, savePrivateKey } from '@/lib/crypto';

function SignUpForm() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code') || '';

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.username || !form.full_name) {
      setError('Fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        username: form.username,
        full_name: form.full_name,
        invite_code: inviteCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const keyPair = await generateKeyPair();
    savePrivateKey(keyPair.privateKey);
    await supabase.from('profiles').update({ public_key: keyPair.publicKey }).eq('id', data.user_id);

    window.location.href = '/onboarding';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-8 px-6 w-full max-w-md">
        <h1
          className="text-5xl tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>

        <p className="text-zinc-500 text-sm">
          Your invite code: <span className="text-purple-400 tracking-widest">{inviteCode}</span>
        </p>

        <div className="flex flex-col gap-4 w-full" onKeyDown={handleKeyDown}>
          <Input
            type="text"
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          <Input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Join the club'}
          </Button>
        </div>

        <p className="text-xs text-zinc-700">
          By joining you agree to push forward every day.
        </p>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignUpForm />
    </Suspense>
  );
}
