'use client';

import { useState } from 'react';
import { useT } from '@/lib/useT';
import { GoogleButton } from '@/features/auth/GoogleButton';
import Link from 'next/link';
import { Dumbbell, Target, Users, Shield, StickyNote, Trophy, Flame, LayoutDashboard, TrendingUp, Zap } from 'lucide-react';

const FEATURES_EN = [
  { icon: LayoutDashboard, title: 'Personal Dashboard', desc: 'Your command center. Tasks, streaks, XP, calendar — everything in one glance.' },
  { icon: Target, title: 'Track Everything', desc: 'Workouts, notes, goals, habits. Log it, check it off, watch your progress grow.' },
  { icon: Trophy, title: 'Gamified Growth', desc: 'Earn XP, level up, unlock achievements. Your life has a progress bar now.' },
  { icon: Users, title: 'Friends, Not Followers', desc: 'Share your journey with people who actually care. Social accountability.' },
  { icon: Shield, title: 'Encrypted & Private', desc: 'E2E encrypted messages. Private notes only you can see. Your data stays yours.' },
  { icon: TrendingUp, title: 'Activity Pulse', desc: '30-day graphs, mood tracking, streaks. See your patterns, stay consistent.' },
];

const FEATURES_RU = [
  { icon: LayoutDashboard, title: 'Личный дашборд', desc: 'Твой командный центр. Задачи, стрики, XP, календарь — всё на одном экране.' },
  { icon: Target, title: 'Трекай всё', desc: 'Тренировки, заметки, цели, привычки. Записал, отметил, смотришь как растёшь.' },
  { icon: Trophy, title: 'Геймификация', desc: 'Зарабатывай XP, качай уровень, разблокируй достижения. У жизни теперь есть прогресс-бар.' },
  { icon: Users, title: 'Друзья, не подписчики', desc: 'Делись прогрессом с теми, кому не пофиг. Социальная ответственность.' },
  { icon: Shield, title: 'Шифрование и приватность', desc: 'E2E шифрованные сообщения. Приватные заметки. Твои данные — только твои.' },
  { icon: TrendingUp, title: 'Пульс активности', desc: 'Графики за 30 дней, трекер настроения, стрики. Видишь паттерны, держишь ритм.' },
];

export default function Home() {
  const [hit, setHit] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const t = useT();
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';
  const features = isRu ? FEATURES_RU : FEATURES_EN;

  const handleAnimationEnd = () => {
    setHit(true);
    setTimeout(() => setShowContent(true), 600);
  };

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] overflow-hidden">

      {/* ===== HERO ===== */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Gradient mesh */}
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[var(--forge-purple)] blur-[160px] opacity-20" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--forge-purple-dim)] blur-[160px] opacity-15" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
             style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />

        <div className="relative flex flex-col items-center gap-6 w-full max-w-lg">
          {/* FORGE anvil drop */}
          <div className="relative w-full">
            <div className={hit ? '' : 'animate-anvil-drop'} onAnimationEnd={handleAnimationEnd}>
              <h1
                className={`text-[14vw] sm:text-[10vw] leading-none tracking-[0.2em] transition-all duration-150 ${
                  hit ? 'drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]' : 'text-[var(--forge-text-secondary)]'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                FORGE
              </h1>
            </div>
            {hit && (
              <div className="absolute -bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                <div className="w-full max-w-[80vw] h-[2px] bg-gradient-to-r from-transparent via-[var(--forge-purple-bright)] to-transparent animate-impact-line" />
              </div>
            )}
          </div>

          {/* Value proposition */}
          <div className={`flex flex-col items-center gap-5 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-base sm:text-lg text-[var(--forge-text-secondary)] tracking-wide font-light">
              {t('landing.subtitle')}
            </p>

            {/* Hook line — the REAL value prop */}
            <p className="text-[13px] text-[var(--forge-text-tertiary)] max-w-sm leading-relaxed px-4">
              {isRu
                ? 'Не очередная соцсеть. Личный штаб для тех, кто строит себя — трекинг, геймификация, друзья которые толкают вперёд.'
                : 'Not another social network. A personal HQ for those who build themselves — tracking, gamification, friends who push you forward.'}
            </p>

            {/* 3 key pillars */}
            <div className="flex gap-4 text-center">
              {[
                { emoji: '🎯', text: isRu ? 'Трекай' : 'Track' },
                { emoji: '⚡', text: isRu ? 'Качайся' : 'Level up' },
                { emoji: '🤝', text: isRu ? 'Вместе' : 'Together' },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
              <Link href="/signup" className="contents">
                <button className="forge-btn-primary w-full py-3.5 text-[14px] tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
                  {t('landing.enter')}
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
          </div>
        </div>

        {/* Scroll hint */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-5 h-8 rounded-full border-2 border-[var(--forge-border)] flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-[var(--forge-purple-bright)] animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== WHAT IS FORGE ===== */}
      <section className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--forge-text-primary)] mb-4 tracking-tight">
            {isRu ? (
              <>Твой личный <span className="forge-gradient-text">growth engine</span></>
            ) : (
              <>Your personal <span className="forge-gradient-text">growth engine</span></>
            )}
          </h2>
          <p className="text-[14px] text-[var(--forge-text-secondary)] leading-relaxed max-w-md mx-auto">
            {isRu
              ? 'Forge — это место где ты планируешь, делаешь, отмечаешь и видишь свой прогресс. Тренировки, заметки, цели, привычки — всё в одном месте с геймификацией и друзьями.'
              : 'Forge is where you plan, do, check off, and see your progress. Workouts, notes, goals, habits — all in one place with gamification and friends.'}
          </p>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative py-20 px-6">
        <div className="pointer-events-none absolute inset-0 bg-[var(--forge-surface)] opacity-40" />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--forge-text-primary)] text-center mb-10 tracking-tight">
            {isRu ? 'Что внутри' : "What's inside"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="forge-card p-5 flex gap-4">
                <div className="h-11 w-11 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[var(--forge-purple-bright)]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[var(--forge-text-primary)]">{title}</h3>
                  <p className="text-[12px] text-[var(--forge-text-tertiary)] mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MANIFESTO ===== */}
      <section className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--forge-text-primary)] mb-10 tracking-tight">
            {isRu ? (
              <>Для тех, кто <span className="forge-gradient-text">прёт вперёд</span></>
            ) : (
              <>For those who <span className="forge-gradient-text">push forward</span></>
            )}
          </h2>
          <blockquote className="text-[var(--forge-text-secondary)] text-[14px] sm:text-[15px] leading-relaxed italic border-l-2 border-[var(--forge-purple)] pl-5 text-left">
            {isRu ? (
              <>
                «Ты заходишь в Forge, записываешь: понедельник — зал, вторник — помыть машину,
                воскресенье — падел. Делаешь, отмечаешь, фоткаешь, выкладываешь.
                Смотришь как такие же драйвовые люди делают то же самое. Вдохновляешься. Прёшь дальше.
                <br /><br />
                Не важно, 18 тебе или 45. Все в одном клубе. Потому что раз ты здесь — ты вписался.
                Пути назад нет. Только вперёд.»
              </>
            ) : (
              <>
                "You enter Forge, plan your week — hit the gym Monday, wash the car Tuesday,
                play padel Sunday. You do it, check it off, snap a photo, share it.
                You watch other driven people do the same. You get inspired. You push harder.
                <br /><br />
                It doesn't matter if you're 18 and just starting out, or 45 and already made it.
                You're all in the same club. Because once you're in — you're committed.
                There's no going back. You grind forward."
              </>
            )}
          </blockquote>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 px-6">
        <div className="pointer-events-none absolute inset-0 bg-[var(--forge-surface)] opacity-30" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--forge-text-primary)] text-center mb-10 tracking-tight">
            {isRu ? 'Как это работает' : 'How it works'}
          </h2>
          <div className="flex flex-col gap-6">
            {[
              { num: '01', title: isRu ? 'Записывай' : 'Log it', desc: isRu ? 'Тренировка, заметка, цель, привычка — запиши за 5 секунд' : 'Workout, note, goal, habit — log it in 5 seconds' },
              { num: '02', title: isRu ? 'Отмечай' : 'Check it off', desc: isRu ? 'Выполнил → отметил → получил XP → растёшь в уровне' : 'Done → checked → earned XP → level up' },
              { num: '03', title: isRu ? 'Делись' : 'Share it', desc: isRu ? 'Сделал фотку, выложил в ленту — друзья видят, лайкают, вдохновляются' : 'Snap a photo, post it — friends see, like, get inspired' },
              { num: '04', title: isRu ? 'Прогрессируй' : 'Progress', desc: isRu ? 'Стрики, достижения, графики — видишь как растёшь неделю за неделей' : 'Streaks, achievements, graphs — watch yourself grow week by week' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 items-start">
                <span className="text-2xl font-bold text-[var(--forge-purple)] tabular-nums shrink-0 opacity-60">{num}</span>
                <div>
                  <h3 className="text-[14px] font-semibold text-[var(--forge-text-primary)]">{title}</h3>
                  <p className="text-[12px] text-[var(--forge-text-tertiary)] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[300px] rounded-full bg-[var(--forge-purple)] blur-[140px] opacity-15" />
        </div>
        <div className="relative flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--forge-text-primary)] tracking-tight">
            {isRu ? 'Готов начать?' : 'Ready to forge your path?'}
          </h2>
          <p className="text-[13px] text-[var(--forge-text-tertiary)] max-w-sm">
            {isRu
              ? 'Бесплатно. Без рекламы. Просто зайди и начни строить себя.'
              : 'Free. No ads. Just sign up and start building yourself.'}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link href="/signup" className="contents">
              <button className="forge-btn-primary w-full py-3.5 text-[14px] tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
                {t('landing.enter')}
              </button>
            </Link>
            <GoogleButton mode="signup" />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--forge-border)] py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-lg tracking-[0.15em] text-[var(--forge-text-tertiary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </span>
          <div className="flex gap-4 text-[11px] text-[var(--forge-text-tertiary)]">
            <Link href="/terms" className="hover:text-[var(--forge-text-secondary)] transition-colors">{t('common.terms')}</Link>
            <Link href="/privacy" className="hover:text-[var(--forge-text-secondary)] transition-colors">{t('common.privacy')}</Link>
            <a href="mailto:alex@forgeclub.app" className="hover:text-[var(--forge-text-secondary)] transition-colors">{isRu ? 'Контакты' : 'Contact'}</a>
          </div>
          <span className="text-[11px] text-[var(--forge-text-muted)]">© 2026 Forge</span>
        </div>
      </footer>
    </div>
  );
}
