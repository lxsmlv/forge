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
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl">
          <h1
            className="text-[15vw] sm:text-[10vw] leading-none tracking-[0.2em] text-white drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-md">
            A friends club for those who lift, drive, and live well.
          </p>
          <p className="text-sm text-zinc-600 max-w-sm">
            Not another social network. A place where friends share their journey,
            track their progress, and push each other forward.
          </p>
          <Link
            href="/"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all text-sm"
          >
            Enter with invite code
          </Link>
          <p className="text-xs text-zinc-700">Invite only. No exceptions.</p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
            For those who{' '}
            <span className="text-purple-400">push forward</span>
          </h2>
          <blockquote className="text-zinc-400 text-sm sm:text-base leading-relaxed italic border-l-2 border-purple-600 pl-4 text-left">
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
      <section className="py-20 px-6 bg-zinc-950/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">What's inside</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-5 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to forge your path?</h2>
        <p className="text-sm text-zinc-500 mb-8">Get an invite from an existing member. Or request access.</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all text-sm"
        >
          Enter Forge
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-lg tracking-[0.15em] text-zinc-600"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FORGE
          </span>
          <div className="flex gap-4 text-xs text-zinc-700">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <a href="mailto:alex@forgeclub.app" className="hover:text-zinc-400 transition-colors">Contact</a>
          </div>
          <span className="text-xs text-zinc-800">© 2026 Forge</span>
        </div>
      </footer>
    </div>
  );
}
