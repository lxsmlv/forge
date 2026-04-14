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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-8 px-6 w-full max-w-md">
        <h1 className="text-5xl tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          style={{ fontFamily: 'var(--font-display)' }}>FORGE</h1>

        {done ? (
          <p className="text-green-400 text-sm">Password updated! Redirecting...</p>
        ) : (
          <>
            <p className="text-zinc-500 text-sm">Set your new password.</p>
            <div className="flex flex-col gap-4 w-full">
              <Input type="password" placeholder="New password" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30" />
              <Input type="password" placeholder="Confirm password" value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30" />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button onClick={handleUpdate} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50">
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
