'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ActivityGrid({ userId }: { userId: string }) {
  const [activity, setActivity] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: posts } = await supabase
        .from('posts')
        .select('created_at')
        .eq('author_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: workouts } = await supabase
        .from('workouts')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const counts: Record<string, number> = {};
      for (const item of [...(posts || []), ...(workouts || [])]) {
        const day = new Date(item.created_at).toISOString().split('T')[0];
        counts[day] = (counts[day] || 0) + 1;
      }
      setActivity(counts);
    }
    load();
  }, [userId]);

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-zinc-900';
    if (count === 1) return 'bg-purple-900/50';
    if (count <= 3) return 'bg-purple-700/60';
    return 'bg-purple-500';
  };

  return (
    <div className="mt-4">
      <h3 className="text-xs font-medium text-zinc-600 mb-2">Last 30 days</h3>
      <div className="flex gap-[3px] flex-wrap">
        {days.map((day) => {
          const count = activity[day] || 0;
          return (
            <div
              key={day}
              className={`h-3 w-3 rounded-sm ${getColor(count)} transition-colors`}
              title={`${day}: ${count} activities`}
            />
          );
        })}
      </div>
    </div>
  );
}
