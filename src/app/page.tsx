'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/useT';
import { GoogleButton } from '@/features/auth/GoogleButton';
import Link from 'next/link';

export default function Home() {
  const [hit, setHit] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const t = useT();

  const handleAnimationEnd = () => {
    setHit(true);
    setTimeout(() => setShowContent(true), 600);
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
          <p className="text-sm sm:text-base md:text-[2.2vw] text-zinc-500 tracking-[0.1em] sm:tracking-[0.15em] px-4">
            {t('landing.subtitle')}
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-300"
              >
                {t('auth.join')}
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <GoogleButton mode="signup" />
          </div>

          <Link href="/login" className="text-xs text-zinc-600 hover:text-purple-400 transition-colors">
            {t('landing.already_member')}
          </Link>

          <div className="flex gap-3 text-[10px] text-zinc-700">
            <Link href="/terms" className="hover:text-zinc-500 transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-zinc-500 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
