'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { generateKeyPair, savePrivateKey, getStoredPrivateKey, decryptPrivateKeyWithPassword, encryptPrivateKeyWithPassword } from '@/lib/crypto';
import { useT } from '@/lib/useT';
import { GoogleButton } from '@/features/auth/GoogleButton';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useT();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    let loginEmail = email;

    // Если ввели не email — ищем по username
    if (!email.includes('@')) {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', email.toLowerCase())
        .maybeSingle();

      if (!profile) {
        setError('User not found');
        setLoading(false);
        return;
      }

      // Получаем email через API route
      const res = await fetch(`/api/get-email?userId=${profile.id}`);
      const data = await res.json();

      if (!res.ok || !data.email) {
        setError('User not found');
        setLoading(false);
        return;
      }

      loginEmail = data.email;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      setError('Invalid credentials');
      setLoading(false);
      return;
    }

    if (!getStoredPrivateKey()) {
      const supabase2 = createClient();
      const { data: { user } } = await supabase2.auth.getUser();
      if (user) {
        const { data: profile } = await supabase2.from('profiles').select('encrypted_private_key, public_key').eq('id', user.id).single();

        if (profile?.encrypted_private_key) {
          // Decrypt private key with password
          const privateKey = await decryptPrivateKeyWithPassword(profile.encrypted_private_key, password);
          if (privateKey) {
            savePrivateKey(privateKey);
          }
        } else if (!profile?.public_key) {
          // No keys at all — generate new ones
          const keyPair = await generateKeyPair();
          savePrivateKey(keyPair.privateKey);
          const encryptedByPassword = await encryptPrivateKeyWithPassword(keyPair.privateKey, password);
          await supabase2.from('profiles').update({
            public_key: keyPair.publicKey,
            encrypted_private_key: encryptedByPassword,
          }).eq('id', user.id);
        }
      }
    }

    window.location.href = '/feed';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
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

        <p className="text-zinc-500 text-sm">{t('auth.welcome_back')}</p>

        <div className="flex flex-col gap-4 w-full" onKeyDown={handleKeyDown}>
          <Input
            type="text"
            placeholder={t('auth.username') + ' / ' + t('auth.email')}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          <Input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? t('auth.signing_in') : t('auth.signin')}
          </Button>

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <GoogleButton mode="login" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link href="/reset-password" className="text-xs text-zinc-600 hover:text-purple-400 transition-colors">
            Forgot password?
          </Link>
          <Link href="/" className="text-xs text-zinc-600 hover:text-purple-400 transition-colors">
            {t('auth.no_account')}
          </Link>
        </div>
      </div>
    </div>
  );
}
