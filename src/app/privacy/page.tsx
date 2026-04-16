import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link href="/" className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">Privacy Policy</span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 prose prose-invert prose-sm prose-zinc">
        <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
        <p className="text-zinc-400 text-xs">Last updated: April 13, 2026</p>

        <h2 className="text-base font-semibold text-white mt-6">1. What We Collect</h2>
        <ul className="text-zinc-400 list-disc pl-4">
          <li>Account information: email, username, name</li>
          <li>Profile data: bio, city, car, sports (provided by you)</li>
          <li>Content: posts, photos, videos, comments, notes, workouts</li>
          <li>Usage data: login activity, interactions</li>
        </ul>

        <h2 className="text-base font-semibold text-white mt-6">2. How We Use It</h2>
        <ul className="text-zinc-400 list-disc pl-4">
          <li>To provide and improve Forge</li>
          <li>To show your content to other members</li>
          <li>To send notifications about activity</li>
          <li>To enforce our terms and moderate content</li>
        </ul>

        <h2 className="text-base font-semibold text-white mt-6">3. Your Private Data</h2>
        <p className="text-zinc-400">Your Cabinet (notes, workouts) is private. Only you can see it. Direct messages are end-to-end encrypted — we cannot read them.</p>

        <h2 className="text-base font-semibold text-white mt-6">4. Data Storage</h2>
        <p className="text-zinc-400">Data is stored on Supabase (EU region). Photos and videos are stored in secure cloud storage.</p>

        <h2 className="text-base font-semibold text-white mt-6">5. Third Parties</h2>
        <p className="text-zinc-400">We do not sell your data. We use Supabase for infrastructure and Vercel for hosting. No advertising trackers.</p>

        <h2 className="text-base font-semibold text-white mt-6">6. Your Rights</h2>
        <ul className="text-zinc-400 list-disc pl-4">
          <li>Access your data through your profile</li>
          <li>Edit or delete your content at any time</li>
          <li>Delete your account completely through Settings</li>
          <li>Request data export by emailing us</li>
        </ul>

        <h2 className="text-base font-semibold text-white mt-6">7. Cookies</h2>
        <p className="text-zinc-400">We use essential cookies for authentication. No tracking cookies.</p>

        <h2 className="text-base font-semibold text-white mt-6">8. Contact</h2>
        <p className="text-zinc-400">alex@forgeclub.app</p>
      </main>
    </div>
  );
}
