'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

const OPTIONS = [
  {
    id: 'current',
    name: 'Текущий (Pushechny v1)',
    linear: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #c084fc 0%, #a855f7 50%, #8b5cf6 100%)',
    desc: 'Весь violet-500/purple, никакой глубины',
  },
  {
    id: 'A',
    name: 'A — Deep Violet Fire',
    linear: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 45%, #c084fc 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #c084fc 0%, #8b5cf6 45%, #4c1d95 100%)',
    desc: 'Глубокий старт → яркая вершина. Угли → пламя → искра',
  },
  {
    id: 'B',
    name: 'B — Twilight Forge',
    linear: 'linear-gradient(135deg, #5b21b6 0%, #9333ea 50%, #c084fc 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #c084fc 0%, #9333ea 50%, #5b21b6 100%)',
    desc: 'Sophisticated, premium, без агрессии',
  },
  {
    id: 'C',
    name: 'C — Molten Metal ⚡',
    linear: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 50%, #d946ef 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #d946ef 0%, #8b5cf6 50%, #5b21b6 100%)',
    desc: 'Magenta в конце = тепло кузницы. Нестандарт',
  },
  {
    id: 'D',
    name: 'D — Purple Inferno',
    linear: 'linear-gradient(135deg, #3b0764 0%, #7c3aed 40%, #f0abfc 100%)',
    radial: 'radial-gradient(circle at 30% 30%, #f0abfc 0%, #7c3aed 40%, #3b0764 100%)',
    desc: 'Максимальный range. Near-black → fire spark',
  },
];

export default function GradientsPreview() {
  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5">
          <Link href="/feed" className="text-sm text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)]">← Back</Link>
          <span className="text-sm font-semibold">Gradient Preview</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-8">
        <div className="text-center">
          <p className="text-[13px] text-[var(--forge-text-secondary)]">
            Все варианты на твоих реальных компонентах. Выбирай по ощущению.
          </p>
        </div>

        {OPTIONS.map((opt) => (
          <section key={opt.id} className="flex flex-col gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-[var(--forge-text-primary)]">
                {opt.name}
              </h2>
              <p className="text-[12px] text-[var(--forge-text-tertiary)] mt-0.5">
                {opt.desc}
              </p>
            </div>

            {/* Big swatch — linear */}
            <div
              className="h-16 rounded-[var(--forge-radius-lg)]"
              style={{ background: opt.linear }}
            />

            {/* FAB + CTA button side by side */}
            <div className="flex items-center gap-4">
              <button
                className="forge-press h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: opt.radial,
                  boxShadow: '0 0 24px rgba(139,92,246,0.4)',
                }}
              >
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>

              <button
                className="forge-press flex-1 py-3 rounded-[var(--forge-radius-md)] font-semibold text-[13px] uppercase text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                style={{
                  background: opt.linear,
                  letterSpacing: '0.08em',
                }}
              >
                Join The Club
              </button>
            </div>

            {/* Chat bubble mockup */}
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
          </section>
        ))}

        <section className="flex flex-col gap-3 border-t border-[var(--forge-border)] pt-6 mt-4">
          <h2 className="text-[15px] font-bold">Гибрид: C (линейный для CTA) + C-radial для FAB</h2>
          <p className="text-[12px] text-[var(--forge-text-tertiary)]">
            Разные визуальные глубины под разные UI-функции, узнаваемо один бренд.
          </p>
          <div className="flex items-center gap-4">
            <button
              className="forge-press h-12 w-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #d946ef 0%, #8b5cf6 50%, #5b21b6 100%)',
                boxShadow: '0 0 28px rgba(217, 70, 239, 0.35), 0 0 12px rgba(139, 92, 246, 0.45)',
              }}
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>

            <button
              className="forge-press flex-1 py-3 rounded-[var(--forge-radius-md)] font-semibold text-[13px] uppercase text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]"
              style={{
                background: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 50%, #d946ef 100%)',
                letterSpacing: '0.08em',
              }}
            >
              Join The Club
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
