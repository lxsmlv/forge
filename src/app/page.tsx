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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--forge-black)] text-[var(--forge-text-primary)] overflow-hidden">
      {/* Gradient mesh atmosphere */}
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[var(--forge-purple)] blur-[160px] opacity-20" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--forge-purple-dim)] blur-[160px] opacity-15" />
      </div>

      {/* Grain / noise overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
           style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />

      <div className="relative flex flex-col items-center gap-8 px-6 text-center w-full">

        {/* FORGE with anvil drop */}
        <div className="relative w-full">
          <div className={hit ? '' : 'animate-anvil-drop'} onAnimationEnd={handleAnimationEnd}>
            <h1
              className={`text-[14vw] leading-none tracking-[0.2em] transition-all duration-150 ${
                hit ? 'drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]' : 'text-[var(--forge-text-secondary)]'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              FORGE
            </h1>
          </div>

          {/* Impact lines */}
          {hit && (
            <div className="absolute -bottom-1 left-0 right-0 flex justify-center pointer-events-none">
              <div className="w-full max-w-[80vw] h-[2px] bg-gradient-to-r from-transparent via-[var(--forge-purple-bright)] to-transparent animate-impact-line" />
            </div>
          )}
          {hit && (
            <div className="absolute bottom-[-5px] left-0 right-0 flex justify-center pointer-events-none">
              <div className="w-full max-w-[60vw] h-[1px] bg-gradient-to-r from-transparent via-[rgba(167,139,250,0.4)] to-transparent animate-impact-line" />
            </div>
          )}
        </div>

        {/* Content after impact */}
        <div
          className={`flex flex-col items-center gap-7 transition-all duration-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-sm sm:text-base md:text-[2.2vw] text-[var(--forge-text-secondary)] tracking-[0.15em] px-4 font-light">
            {t('landing.subtitle')}
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/signup" className="contents">
              <button className="forge-btn-primary w-full py-3.5 text-[14px] tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
                {t('auth.join')}
              </button>
            </Link>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-[var(--forge-border)]" />
              <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-widest">{t('common.or')}</span>
              <div className="flex-1 h-px bg-[var(--forge-border)]" />
            </div>

            <GoogleButton mode="signup" />
          </div>

          <Link href="/login" className="text-[12px] text-[var(--forge-text-tertiary)] hover:text-[var(--forge-purple-bright)] transition-colors">
            {t('landing.already_member')}
          </Link>

          <div className="flex gap-3 text-[10px] text-[var(--forge-text-muted)]">
            <Link href="/terms" className="hover:text-[var(--forge-text-tertiary)] transition-colors">{t('common.terms')}</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-[var(--forge-text-tertiary)] transition-colors">{t('common.privacy')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
