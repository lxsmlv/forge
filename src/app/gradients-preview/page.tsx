'use client';

import { Home, MessageCircle, Plus, BookOpen, User } from 'lucide-react';
import Link from 'next/link';

const OPTIONS = [
  {
    id: 'A',
    name: 'A — Deep Violet Fire',
    linear: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 45%, #c084fc 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #c084fc 0%, #8b5cf6 45%, #4c1d95 100%)',
    desc: 'Глубокий старт #4c1d95 → яркая вершина #c084fc. Максимальная драма',
  },
  {
    id: 'AB',
    name: 'AB — Hybrid (моя новая рекомендация)',
    linear: 'linear-gradient(135deg, #4c1d95 0%, #9333ea 50%, #c084fc 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #c084fc 0%, #9333ea 50%, #4c1d95 100%)',
    desc: 'A-глубина старта + B-благородная середина (purple-600). Менее one-note',
  },
  {
    id: 'B',
    name: 'B — Twilight Forge',
    linear: 'linear-gradient(135deg, #5b21b6 0%, #9333ea 50%, #c084fc 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #c084fc 0%, #9333ea 50%, #5b21b6 100%)',
    desc: 'Старт чуть светлее, ближе к благородному. Спокойнее A',
  },
];

// Plus-button styles — from minimalist to dramatic
const PLUS_STYLES = [
  {
    name: '1. Flat (минимал, никакой 3D)',
    getStyle: (_linear: string, radial: string) => ({
      background: radial,
      boxShadow: '0 0 24px rgba(139,92,246,0.4)',
    }),
  },
  {
    name: '2. Bevel (лёгкая выпуклость)',
    getStyle: (_linear: string, radial: string) => ({
      background: radial,
      boxShadow:
        '0 0 24px rgba(139,92,246,0.4), ' +
        'inset 0 1px 0 rgba(255,255,255,0.4), ' +
        'inset 0 -2px 4px rgba(0,0,0,0.25)',
    }),
  },
  {
    name: '3. Molten orb (шар-пламя, макс. глубина)',
    getStyle: (_linear: string, radial: string) => ({
      background: radial,
      boxShadow:
        '0 6px 20px rgba(76,29,149,0.5), ' +
        '0 0 30px rgba(192,132,252,0.3), ' +
        'inset 0 1px 2px rgba(255,255,255,0.5), ' +
        'inset 0 -3px 6px rgba(76,29,149,0.4)',
    }),
  },
  {
    name: '4. Neon (плоский + сильное свечение)',
    getStyle: (linear: string, _radial: string) => ({
      background: linear,
      boxShadow:
        '0 0 0 1px rgba(192,132,252,0.3), ' +
        '0 0 20px rgba(168,85,247,0.55), ' +
        '0 0 40px rgba(192,132,252,0.35)',
    }),
  },
  {
    name: '5. Stamp ring (полая обводка, прозрачный центр)',
    getStyle: (linear: string, _radial: string) => ({
      background: 'transparent',
      border: '2px solid',
      borderImage: `${linear} 1`,
      borderImageSlice: 1,
      boxShadow:
        '0 0 20px rgba(139,92,246,0.4), ' +
        'inset 0 0 12px rgba(139,92,246,0.25)',
    }),
  },
];

export default function GradientsPreview() {
  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-32">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5">
          <Link href="/feed" className="text-sm text-[var(--forge-text-secondary)]">← Back</Link>
          <span className="text-sm font-semibold">Gradient Preview</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-10">
        <div className="text-center">
          <p className="text-[13px] text-[var(--forge-text-secondary)]">
            Каждый вариант — на swatch, CTA-кнопке, чат-пузыре и <b>в реальной bottom-nav</b> с тремя стилями плюса.
          </p>
        </div>

        {OPTIONS.map((opt) => (
          <section key={opt.id} className="flex flex-col gap-4 pb-6 border-b border-[var(--forge-border)]">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--forge-text-primary)]">
                {opt.name}
              </h2>
              <p className="text-[12px] text-[var(--forge-text-tertiary)] mt-0.5">
                {opt.desc}
              </p>
            </div>

            {/* Big swatch */}
            <div
              className="h-16 rounded-[var(--forge-radius-lg)]"
              style={{ background: opt.linear }}
            />

            {/* CTA button */}
            <button
              className="forge-press w-full py-3 rounded-[var(--forge-radius-md)] font-semibold text-[13px] uppercase text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]"
              style={{
                background: opt.linear,
                letterSpacing: '0.08em',
              }}
            >
              Join The Club
            </button>

            {/* Chat bubble */}
            <div className="flex justify-end">
              <div
                className="max-w-[75%] px-3.5 py-2 rounded-[18px] rounded-br-[6px] text-[14px] text-white shadow-[0_2px_12px_rgba(139,92,246,0.28)]"
                style={{ background: opt.linear }}
              >
                Сегодня был в зале, бицуха в огне 💪
                <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  12:34
                </div>
              </div>
            </div>

            {/* Bottom nav mockup × 5 plus styles */}
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[11px] uppercase tracking-wider text-[var(--forge-text-tertiary)]">
                Plus в bottom-nav (5 вариантов глубины/стиля):
              </p>
              {PLUS_STYLES.map((ps) => (
                <div key={ps.name} className="flex flex-col gap-1">
                  <p className="text-[11px] text-[var(--forge-text-tertiary)] pl-1">{ps.name}</p>
                  <div className="forge-bottom-nav relative rounded-[var(--forge-radius-lg)] overflow-hidden">
                    <div className="flex items-center justify-around px-4 py-1.5">
                      <NavIcon Icon={Home} label="Feed" />
                      <NavIcon Icon={MessageCircle} label="Msgs" />
                      <button
                        type="button"
                        className="h-11 w-11 rounded-full flex items-center justify-center"
                        style={ps.getStyle(opt.linear, opt.radial)}
                      >
                        <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </button>
                      <NavIcon Icon={BookOpen} label="Cabinet" />
                      <NavIcon Icon={User} label="Profile" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="text-center text-[12px] text-[var(--forge-text-tertiary)] pt-4">
          Скажи в чате формата <b>«AB 3»</b> (gradient AB + plus style 3 molten). Или два разных: «AB для кнопок, AB 1 для плюса».
        </p>
      </main>
    </div>
  );
}

function NavIcon({ Icon, label }: { Icon: typeof Home; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1.5 px-4 text-[var(--forge-text-tertiary)]">
      <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </div>
  );
}
