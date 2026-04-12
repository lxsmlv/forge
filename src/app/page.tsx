'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [hit, setHit] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnimationEnd = () => {
    setHit(true);
    setTimeout(() => setShowContent(true), 600);
  };

  const handleEnterClick = () => {
    setShowInviteInput(true);
  };

  const handleSubmitCode = async () => {
    if (!inviteCode.trim()) {
      setError('Enter your invite code');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from('invite_codes')
      .select('id, used_by')
      .eq('code', inviteCode.trim())
      .maybeSingle();

    if (dbError || !data) {
      setError('Invalid invite code');
      setLoading(false);
      return;
    }

    if (data.used_by && inviteCode.trim() !== '000000') {
      setError('This code has already been used');
      setLoading(false);
      return;
    }

    window.location.href = '/signup?code=' + encodeURIComponent(inviteCode.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmitCode();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden">
      <div className="relative flex flex-col items-center gap-8 px-6 text-center w-full">

        {/* FORGE with anvil drop */}
        <div className="relative w-full">
          <div className={hit ? '' : 'animate-anvil-drop'} onAnimationEnd={handleAnimationEnd}>
            <h1
              className={`text-[14vw] leading-none tracking-[0.2em] transition-all duration-150 ${
                hit ? 'text-white drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]' : 'text-zinc-300'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              FORGE
            </h1>
          </div>

          {/* Impact lines */}
          {hit && (
            <div className="absolute -bottom-1 left-0 right-0 flex justify-center pointer-events-none">
              <div className="w-full max-w-[80vw] h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-impact-line" />
            </div>
          )}
          {hit && (
            <div className="absolute bottom-[-5px] left-0 right-0 flex justify-center pointer-events-none">
              <div className="w-full max-w-[60vw] h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent animate-impact-line" />
            </div>
          )}
        </div>

        {/* Content after impact */}
        <div
          className={`flex flex-col items-center gap-6 transition-all duration-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-[2.2vw] text-zinc-500 tracking-[0.15em]">
            Private club for men who lift, drive, and live well.
          </p>

          {/* Invite code input or button */}
          {!showInviteInput ? (
            <Button
              size="lg"
              onClick={handleEnterClick}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-300"
            >
              Enter with invite code
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="INVITE CODE"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-64 bg-zinc-900 border-zinc-800 text-white text-center tracking-[0.3em] placeholder:text-zinc-600 placeholder:tracking-[0.3em] focus:border-purple-600 focus:ring-purple-600/30"
                />
                <Button
                  onClick={handleSubmitCode}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? '...' : 'GO'}
                </Button>
              </div>
              {error && (
                <p className="text-red-500 text-sm animate-in fade-in duration-200">{error}</p>
              )}
            </div>
          )}

          <p className="text-sm text-zinc-700">
            Invite only. No exceptions.
          </p>
        </div>
      </div>
    </div>
  );
}
