import Link from 'next/link';
import { Dumbbell, Car, Users, Shield, StickyNote, Trophy, Flame, MessageCircle } from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Friends Club', desc: 'A place for you and your friends. No random people, no noise.' },
  { icon: Dumbbell, title: 'Track Your Grind', desc: 'Log workouts, set goals, build streaks.' },
  { icon: Car, title: 'Show Your Ride', desc: 'Share your car, detailing sessions, builds.' },
  { icon: StickyNote, title: 'Private Cabinet', desc: 'Personal notes, plans, and reminders. Only you see them.' },
  { icon: Shield, title: 'Encrypted DMs', desc: 'End-to-end encrypted messages. We can\'t read them.' },
  { icon: Trophy, title: 'Achievements', desc: 'Earn badges for consistency. Flex your streak.' },
  { icon: Flame, title: 'Stories', desc: '24-hour moments. Share the raw, unfiltered stuff.' },
  { icon: MessageCircle, title: 'Groups', desc: 'Create communities within Forge. Gym Rats, Car Detailing Club, whatever.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--forge-purple)] blur-[180px] opacity-15" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--forge-purple-dim)] blur-[160px] opacity-20" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay"
             style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl">
          <h1
            className="text-[15vw] sm:text-[10vw] leading-none tracking-[0.2em] drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </h1>
          <p className="text-lg sm:text-xl text-[var(--forge-text-secondary)] max-w-md font-light">
            A friends club for those who lift, drive, and live well.
          </p>
          <p className="text-[13px] text-[var(--forge-text-tertiary)] max-w-sm leading-relaxed">
            Not another social network. A place where friends share their journey,
            track their progress, and push each other forward.
          </p>
          <Link href="/" className="contents">
            <button className="forge-btn-primary px-8 py-3.5 text-[13px] tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
              Enter Forge
            </button>
          </Link>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--forge-text-primary)] mb-10 tracking-tight">
            For those who{' '}
            <span className="forge-gradient-text">push forward</span>
          </h2>
          <blockquote className="text-[var(--forge-text-secondary)] text-[15px] sm:text-base leading-relaxed italic border-l-2 border-[var(--forge-purple)] pl-5 text-left">
            "You enter Forge, plan your week — hit the gym Monday, wash the car Tuesday,
            play padel Sunday. You do it, check it off, snap a photo, share it.
            You watch other driven people do the same. You get inspired. You push harder.
            <br /><br />
            It doesn't matter if you're 18 and just starting out, or 45 and already made it.
            You're all in the same club. Because once you pay those $15, you're committed.
            There's no going back. You grind forward."
          </blockquote>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="pointer-events-none absolute inset-0 bg-[var(--forge-surface)] opacity-60" />
        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--forge-text-primary)] text-center mb-12 tracking-tight">What's inside</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
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

      {/* CTA */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[300px] rounded-full bg-[var(--forge-purple)] blur-[140px] opacity-15" />
        </div>
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--forge-text-primary)] mb-4 tracking-tight">Ready to forge your path?</h2>
          <p className="text-[13px] text-[var(--forge-text-tertiary)] mb-8">Get an invite from an existing member. Or request access.</p>
          <Link href="/" className="contents">
            <button className="forge-btn-primary px-8 py-3.5 text-[13px] tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
              Enter Forge
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--forge-border)] py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-lg tracking-[0.15em] text-[var(--forge-text-tertiary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </span>
          <div className="flex gap-4 text-[11px] text-[var(--forge-text-tertiary)]">
            <Link href="/terms" className="hover:text-[var(--forge-text-secondary)] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--forge-text-secondary)] transition-colors">Privacy</Link>
            <a href="mailto:alex@forgeclub.app" className="hover:text-[var(--forge-text-secondary)] transition-colors">Contact</a>
          </div>
          <span className="text-[11px] text-[var(--forge-text-muted)]">© 2026 Forge</span>
        </div>
      </footer>
    </div>
  );
}
