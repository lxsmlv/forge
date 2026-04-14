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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-8 px-6 w-full max-w-md">
        <h1
          className="text-5xl tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h1>

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-zinc-400 text-sm">{t('reset.check_email')}</p>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm">{t('reset.back')}</Link>
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-sm">{t('reset.enter_email')}</p>
            <div className="flex flex-col gap-4 w-full">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button onClick={handleReset} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_25px_rgba(147,51,234,0.4)] disabled:opacity-50">
                {loading ? t('reset.sending') : t('reset.send')}
              </Button>
            </div>
            <Link href="/login" className="text-xs text-zinc-600 hover:text-purple-400 transition-colors">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
