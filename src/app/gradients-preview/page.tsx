'use client';

import { Home, MessageCircle, Plus, BookOpen, User } from 'lucide-react';
import Link from 'next/link';

// AB gradient — locked choice
const AB_LINEAR = 'linear-gradient(135deg, #4c1d95 0%, #9333ea 50%, #c084fc 100%)';
const AB_LINEAR_TOP = 'linear-gradient(180deg, #c084fc 0%, #9333ea 50%, #4c1d95 100%)'; // lit from above

// Planet-inspired neon variants
const NEON_VARIANTS = [
  {
    id: 1,
    name: '1. Standard Neon (baseline)',
    desc: 'Линейный fill + ровное outer glow',
    background: AB_LINEAR,
    boxShadow:
      '0 0 0 1px rgba(192,132,252,0.3), ' +
      '0 0 20px rgba(168,85,247,0.55), ' +
      '0 0 40px rgba(192,132,252,0.35)',
    animate: false,
  },
  {
    id: 2,
    name: '2. Halo Ring',
    desc: 'Тонкое яркое кольцо по краю (surface detail) + умеренное glow',
    background: AB_LINEAR,
    boxShadow:
      '0 0 0 1.5px rgba(216,180,254,0.8), ' +
      '0 0 0 2.5px rgba(147,51,234,0.4), ' +
      '0 0 18px rgba(168,85,247,0.5), ' +
      '0 0 36px rgba(192,132,252,0.28)',
    animate: false,
  },
  {
    id: 3,
    name: '3. Atmosphere (многослойное свечение, планета)',
    desc: 'Плотная аура у поверхности → widely spread soft halo',
    background: AB_LINEAR,
    boxShadow:
      '0 0 0 1px rgba(192,132,252,0.5), ' +
      '0 0 12px rgba(192,132,252,0.7), ' +
      '0 0 28px rgba(168,85,247,0.5), ' +
      '0 0 56px rgba(147,51,234,0.35), ' +
      '0 0 96px rgba(124,58,237,0.18)',
    animate: false,
  },
  {
    id: 4,
    name: '4. Lit from above (солнце сверху)',
    desc: 'Градиент вертикальный — как планета освещённая сверху. Glow сильнее сверху',
    background: AB_LINEAR_TOP,
    boxShadow:
      '0 -6px 24px rgba(192,132,252,0.55), ' +
      '0 2px 20px rgba(76,29,149,0.5), ' +
      '0 0 0 1px rgba(192,132,252,0.25), ' +
      '0 0 40px rgba(168,85,247,0.3)',
    animate: false,
  },
  {
    id: 5,
    name: '5. Cosmic (dual-tone с magenta внешней аурой)',
    desc: 'Violet ядро + magenta-pink внешнее свечение. Космический вайб',
    background: AB_LINEAR,
    boxShadow:
      '0 0 0 1px rgba(192,132,252,0.4), ' +
      '0 0 16px rgba(168,85,247,0.6), ' +
      '0 0 32px rgba(217,70,239,0.45), ' +
      '0 0 64px rgba(244,114,182,0.25)',
    animate: false,
  },
  {
    id: 6,
    name: '6. Breathing Planet (3 + пульс)',
    desc: 'Atmosphere + плавная анимация — "дыхание" атмосферы',
    background: AB_LINEAR,
    boxShadow:
      '0 0 0 1px rgba(192,132,252,0.5), ' +
      '0 0 12px rgba(192,132,252,0.7), ' +
      '0 0 28px rgba(168,85,247,0.5), ' +
      '0 0 56px rgba(147,51,234,0.35)',
    animate: true,
  },
];

export default function GradientsPreview() {
  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-32">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3.5">
          <Link href="/feed" className="text-sm text-[var(--forge-text-secondary)]">← Back</Link>
          <span className="text-sm font-semibold">Neon Plus — Planet Edition</span>
          <div className="w-10" />
        </div>
      </header>

      <style>{`
        @keyframes planet-breathe {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(192,132,252,0.5),
              0 0 12px rgba(192,132,252,0.7),
              0 0 28px rgba(168,85,247,0.5),
              0 0 56px rgba(147,51,234,0.35);
          }
          50% {
            box-shadow:
              0 0 0 1.5px rgba(192,132,252,0.7),
              0 0 16px rgba(192,132,252,0.9),
              0 0 40px rgba(168,85,247,0.7),
              0 0 80px rgba(147,51,234,0.5);
          }
        }
        .breathe-animation {
          animation: planet-breathe 2.8s ease-in-out infinite;
        }
      `}</style>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-8">
        <div className="text-center">
          <p className="text-[13px] text-[var(--forge-text-secondary)]">
            Гradient = <b>AB</b> (locked). 6 вариантов plus-кнопки с «planet»-ощущением.
          </p>
          <p className="text-[12px] text-[var(--forge-text-tertiary)] mt-2">
            Каждый вариант показан <b>крупно</b> (чтобы видеть детали glow) и <b>в реальной bottom-nav</b>.
          </p>
        </div>

        {NEON_VARIANTS.map((v) => (
          <section key={v.id} className="flex flex-col gap-4 pb-6 border-b border-[var(--forge-border)]">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--forge-text-primary)]">
                {v.name}
              </h2>
              <p className="text-[12px] text-[var(--forge-text-tertiary)] mt-0.5">
                {v.desc}
              </p>
            </div>

            {/* Big plus button to show glow details */}
            <div className="flex justify-center py-8 bg-[var(--forge-surface)] rounded-[var(--forge-radius-lg)] border border-[var(--forge-border)]">
              <button
                type="button"
                className={`h-20 w-20 rounded-full flex items-center justify-center ${v.animate ? 'breathe-animation' : ''}`}
                style={{ background: v.background, boxShadow: v.boxShadow }}
              >
                <Plus className="w-9 h-9 text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* In real bottom-nav context at actual size */}
            <div className="forge-bottom-nav relative rounded-[var(--forge-radius-lg)] overflow-hidden">
              <div className="flex items-center justify-around px-4 py-1.5">
                <NavIcon Icon={Home} label="Feed" />
                <NavIcon Icon={MessageCircle} label="Msgs" />
                <button
                  type="button"
                  className={`h-11 w-11 rounded-full flex items-center justify-center ${v.animate ? 'breathe-animation' : ''}`}
                  style={{ background: v.background, boxShadow: v.boxShadow }}
                >
                  <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
                <NavIcon Icon={BookOpen} label="Cabinet" />
                <NavIcon Icon={User} label="Profile" />
              </div>
            </div>
          </section>
        ))}

        <p className="text-center text-[12px] text-[var(--forge-text-tertiary)] pt-4">
          Напиши <b>«1»</b>, <b>«2»</b>, … или <b>«3+6»</b> (Atmosphere + breathe) — применю в проде.
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
