import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-zinc-400">Terms of Service</span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6 prose prose-invert prose-sm prose-zinc">
        <h1 className="text-xl font-bold text-white">Terms of Service</h1>
        <p className="text-zinc-400 text-xs">Last updated: April 13, 2026</p>

        <h2 className="text-base font-semibold text-white mt-6">1. Acceptance</h2>
        <p className="text-zinc-400">By accessing Forge (forgeclub.app), you agree to these terms. If you disagree, do not use the service.</p>

        <h2 className="text-base font-semibold text-white mt-6">2. Eligibility</h2>
        <p className="text-zinc-400">You must be at least 16 years old. Forge is an invite-only platform. Access requires a valid invite code.</p>

        <h2 className="text-base font-semibold text-white mt-6">3. Your Account</h2>
        <p className="text-zinc-400">You are responsible for maintaining the security of your account. Do not share your credentials. You are responsible for all activity under your account.</p>

        <h2 className="text-base font-semibold text-white mt-6">4. Content</h2>
        <p className="text-zinc-400">You retain ownership of content you post. By posting, you grant Forge a non-exclusive license to display your content within the platform. You must not post illegal, harmful, abusive, or hateful content. Content violating these rules will be removed.</p>

        <h2 className="text-base font-semibold text-white mt-6">5. Prohibited Conduct</h2>
        <ul className="text-zinc-400 list-disc pl-4">
          <li>Harassment, bullying, or threats</li>
          <li>Spam or misleading content</li>
          <li>Impersonation of others</li>
          <li>Sharing others' private information</li>
          <li>Circumventing security measures</li>
          <li>Using bots or automated access</li>
        </ul>

        <h2 className="text-base font-semibold text-white mt-6">6. Termination</h2>
        <p className="text-zinc-400">We may suspend or terminate your account for violations. You may delete your account at any time through Settings.</p>

        <h2 className="text-base font-semibold text-white mt-6">7. Disclaimer</h2>
        <p className="text-zinc-400">Forge is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p>

        <h2 className="text-base font-semibold text-white mt-6">8. Changes</h2>
        <p className="text-zinc-400">We may update these terms. Continued use constitutes acceptance of changes.</p>

        <h2 className="text-base font-semibold text-white mt-6">9. Contact</h2>
        <p className="text-zinc-400">Questions? Email alex@forgeclub.app</p>
      </main>
    </div>
  );
}
