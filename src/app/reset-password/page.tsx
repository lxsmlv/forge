'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useT } from '@/lib/useT';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const t = useT();

  const handleReset = async () => {
    if (!email) { setError('Enter your email'); return; }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-[var(--forge-text-secondary)] text-sm">{t('reset.check_email')}</p>
            <Link href="/login" className="text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] text-sm transition-colors">{t('reset.back')}</Link>
          </div>
        ) : (
          <>
            <p className="text-[var(--forge-text-secondary)] text-sm">{t('reset.enter_email')}</p>
            <div className="flex flex-col gap-3 w-full">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                className="forge-input"
              />
              {error && <p className="text-[var(--forge-error)] text-[13px] text-center">{error}</p>}
              <button
                onClick={handleReset}
                disabled={loading}
                className="forge-btn-primary w-full py-3 text-[14px] tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ letterSpacing: '0.08em' }}
              >
                {loading ? t('reset.sending') : t('reset.send')}
              </button>
            </div>
            <Link href="/login" className="text-[12px] text-[var(--forge-text-tertiary)] hover:text-[var(--forge-purple-bright)] transition-colors">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
