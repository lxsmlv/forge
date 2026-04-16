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

    // Always refresh private key on login — localStorage may contain a key from
    // another account (e.g. if this device was used to register someone else).
    // Guard-on-presence was causing "unable to decrypt" bugs after multi-account sessions.
    {
      const supabase2 = createClient();
      const { data: { user } } = await supabase2.auth.getUser();
      if (user) {
        const { data: profile } = await supabase2.from('profiles').select('encrypted_private_key, public_key').eq('id', user.id).single();

        if (profile?.encrypted_private_key) {
          // Decrypt and overwrite any existing localStorage key
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--forge-black)] text-[var(--forge-text-primary)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[var(--forge-purple)] blur-[160px] opacity-10" />
      </div>
      <div className="relative flex flex-col items-center gap-8 px-6 w-full max-w-md">
        <h1
          className="text-5xl tracking-[0.2em] drop-shadow-[0_0_40px_rgba(168,85,247,0.35)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>

        <p className="text-[var(--forge-text-secondary)] text-sm">{t('auth.welcome_back')}</p>

        <div className="flex flex-col gap-3 w-full" onKeyDown={handleKeyDown}>
          <Input
            type="text"
            placeholder={t('auth.username') + ' / ' + t('auth.email')}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="forge-input"
          />
          <Input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="forge-input"
          />

          {error && <p className="text-[var(--forge-error)] text-[13px] text-center">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="forge-btn-primary w-full py-3 text-[14px] tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ letterSpacing: '0.08em' }}
          >
            {loading ? t('auth.signing_in') : t('auth.signin')}
          </button>

          <div className="flex items-center gap-3 w-full my-1">
            <div className="flex-1 h-px bg-[var(--forge-border)]" />
            <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[var(--forge-border)]" />
          </div>

          <GoogleButton mode="login" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link href="/reset-password" className="text-[12px] text-[var(--forge-text-tertiary)] hover:text-[var(--forge-purple-bright)] transition-colors">
            Forgot password?
          </Link>
          <Link href="/" className="text-[12px] text-[var(--forge-text-tertiary)] hover:text-[var(--forge-purple-bright)] transition-colors">
            {t('auth.no_account')}
          </Link>
        </div>
      </div>
    </div>
  );
}
