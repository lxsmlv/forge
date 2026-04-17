'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Cabinet } from '@/features/cabinet/Cabinet';
import { HubDashboard } from '@/features/hub/HubDashboard';
import { TopBar } from '@/features/navigation/TopBar';
import { LayoutDashboard, StickyNote, Dumbbell } from 'lucide-react';

type HubTab = 'dashboard' | 'notes' | 'workouts';

function CabinetPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newParam = searchParams.get('new');

  // If query-param says new=note or workout, go straight to that tab
  const initialTab: HubTab = newParam === 'note' ? 'notes' : newParam === 'workout' ? 'workouts' : 'dashboard';
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);
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
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)] mb-4">
          {([
            { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'notes' as const, icon: StickyNote, label: 'Notes' },
            { id: 'workouts' as const, icon: Dumbbell, label: 'Workouts' },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`forge-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--forge-radius-sm)] text-[12px] font-medium transition-all ${
                activeTab === id
                  ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]'
                  : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <HubDashboard onSwitchTab={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'notes' && (
          <Cabinet
            initialModal={activeTab === 'notes' ? initialModal as 'note' | undefined : undefined}
            onModalClosed={handleModalClosed}
            forcedSection="notes"
          />
        )}
        {activeTab === 'workouts' && (
          <Cabinet
            initialModal={activeTab === 'workouts' ? initialModal as 'workout' | undefined : undefined}
            onModalClosed={handleModalClosed}
            forcedSection="workouts"
          />
        )}
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
