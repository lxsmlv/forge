'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { generateKeyPair, savePrivateKey, encryptPrivateKeyWithPassword, generateRecoveryKey } from '@/lib/crypto';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { useT } from '@/lib/useT';

function SignUpForm() {
  const t = useT();
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

    const encryptedByPassword = await encryptPrivateKeyWithPassword(keyPair.privateKey, form.password);
    const recoveryKey = generateRecoveryKey();
    const encryptedByRecovery = await encryptPrivateKeyWithPassword(keyPair.privateKey, recoveryKey);

    await supabase.from('profiles').update({
      public_key: keyPair.publicKey,
      encrypted_private_key: encryptedByPassword,
      recovery_encrypted_key: encryptedByRecovery,
    }).eq('id', data.user_id);

    localStorage.setItem('forge_recovery_key', recoveryKey);
    window.location.href = `/onboarding?recovery=${encodeURIComponent(recoveryKey)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--forge-black)] text-[var(--forge-text-primary)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[var(--forge-purple)] blur-[160px] opacity-10" />
      </div>
      <div className="relative flex flex-col items-center gap-8 px-6 w-full max-w-md py-12">
        <h1
          className="text-5xl tracking-[0.2em] drop-shadow-[0_0_40px_rgba(168,85,247,0.35)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>


        <div className="flex flex-col gap-3 w-full" onKeyDown={handleKeyDown}>
          <Input
            type="text"
            placeholder={t('auth.full_name')}
            value={form.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            className="forge-input"
          />
          <Input
            type="text"
            placeholder={t('auth.username')}
            value={form.username}
            onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="forge-input"
          />
          <Input
            type="email"
            placeholder={t('auth.email')}
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="forge-input"
          />
          <Input
            type="password"
            placeholder={t('auth.password')}
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="forge-input"
          />

          {error && (
            <p className="text-[var(--forge-error)] text-[13px] text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="forge-btn-primary w-full py-3 text-[14px] tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ letterSpacing: '0.08em' }}
          >
            {loading ? t('auth.creating') : t('auth.join')}
          </button>

          <div className="flex items-center gap-3 w-full my-1">
            <div className="flex-1 h-px bg-[var(--forge-border)]" />
            <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-widest">{t('common.or')}</span>
            <div className="flex-1 h-px bg-[var(--forge-border)]" />
          </div>

          <GoogleButton mode="signup" />
        </div>

        <p className="text-[11px] text-[var(--forge-text-tertiary)] text-center">
          {t('auth.agree_prefix')}{' '}
          <a href="/terms" className="text-[var(--forge-text-secondary)] hover:text-[var(--forge-purple-bright)] underline">{t('auth.agree_terms')}</a> {t('auth.agree_and')}{' '}
          <a href="/privacy" className="text-[var(--forge-text-secondary)] hover:text-[var(--forge-purple-bright)] underline">{t('auth.agree_privacy')}</a>.
        </p>

        <a href="/login" className="text-[12px] text-[var(--forge-text-tertiary)] hover:text-[var(--forge-purple-bright)] transition-colors">
          {t('auth.already_have')}
        </a>
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
