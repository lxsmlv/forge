'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleUpdate = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) { setError(updateError.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => { window.location.href = '/feed'; }, 2000);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--forge-black)] text-[var(--forge-text-primary)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[var(--forge-purple)] blur-[160px] opacity-10" />
      </div>
      <div className="relative flex flex-col items-center gap-8 px-6 w-full max-w-md">
        <h1 className="text-5xl tracking-[0.2em] forge-gradient-text drop-shadow-[0_0_40px_rgba(168,85,247,0.35)]"
          style={{ fontFamily: 'var(--font-display)' }}>FORGE</h1>

        {done ? (
          <p className="text-[var(--forge-success)] text-sm">Password updated! Redirecting...</p>
        ) : (
          <>
            <p className="text-[var(--forge-text-secondary)] text-sm">Set your new password.</p>
            <div className="flex flex-col gap-3 w-full">
              <Input type="password" placeholder="New password" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="forge-input" />
              <Input type="password" placeholder="Confirm password" value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                className="forge-input" />
              {error && <p className="text-[var(--forge-error)] text-[13px] text-center">{error}</p>}
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="forge-btn-primary w-full py-3 text-[14px] tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ letterSpacing: '0.08em' }}
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
