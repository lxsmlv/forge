import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1
        className="text-6xl tracking-[0.2em] text-zinc-800 mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        404
      </h1>
      <p className="text-zinc-600 text-sm mb-8">This page doesn't exist in the Forge.</p>
      <Link
        href="/feed"
        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
      >
        Back to Feed
      </Link>
    </div>
  );
}
