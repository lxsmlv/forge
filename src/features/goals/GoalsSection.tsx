'use client';

import { useState, useEffect } from 'react';
import { Plus, Target } from 'lucide-react';
import { getGoals } from './actions';
import { GoalCard } from './GoalCard';
import { GoalCreateModal } from './GoalCreateModal';

export function GoalsSection() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';

  const refresh = async () => {
    const data = await getGoals();
    setGoals(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = filter === 'all' ? goals : filter === 'active' ? goals.filter((g) => !g.is_completed) : goals.filter((g) => g.is_completed);
  const activeCount = goals.filter((g) => !g.is_completed).length;
  const completedCount = goals.filter((g) => g.is_completed).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowModal(true)}
          className="forge-press flex items-center gap-2 text-sm text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors py-2"
        >
          <Plus className="w-4 h-4" />
          {isRu ? 'Новая цель' : 'New goal'}
        </button>
        <div className="flex gap-1.5">
          {([
            { key: 'active' as const, label: isRu ? `Активные (${activeCount})` : `Active (${activeCount})` },
            { key: 'completed' as const, label: isRu ? `Готово (${completedCount})` : `Done (${completedCount})` },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`forge-badge forge-badge-interactive text-[10px] ${filter === key ? 'forge-badge-purple' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
          <Target className="w-8 h-8 mb-2 text-[var(--forge-text-tertiary)]" />
          <p className="text-sm text-[var(--forge-text-tertiary)]">
            {filter === 'completed'
              ? (isRu ? 'Пока нет завершённых целей' : 'No completed goals yet')
              : (isRu ? 'Поставь первую цель и начни трекать прогресс' : 'Set your first goal and start tracking progress')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((goal) => (
            <GoalCard key={goal.id} {...goal} onUpdated={refresh} />
          ))}
        </div>
      )}

      <GoalCreateModal open={showModal} onClose={() => setShowModal(false)} onCreated={refresh} />
    </div>
  );
}
