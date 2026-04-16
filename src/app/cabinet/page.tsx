'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Cabinet } from '@/features/cabinet/Cabinet';
import { useT } from '@/lib/useT';
import { TopBar } from '@/features/navigation/TopBar';

function CabinetPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useT();
  const newParam = searchParams.get('new');
  const initialModal = newParam === 'note' || newParam === 'workout' ? newParam : undefined;

  const handleModalClosed = () => {
    if (initialModal) {
      router.replace('/cabinet');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <TopBar />

      <main className="max-w-lg mx-auto px-4 py-4">
        <Cabinet initialModal={initialModal} onModalClosed={handleModalClosed} />
      </main>
    </div>
  );
}

export default function CabinetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--forge-black)]" />}>
      <CabinetPageInner />
    </Suspense>
  );
}
