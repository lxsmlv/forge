'use client';

import { useState, useEffect, useTransition } from 'react';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getGroups, createGroup } from '@/features/groups/actions';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getGroups().then((data) => { setGroups(data); setLoading(false); });
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const group = await createGroup(name, desc);
      if (group) router.push(`/groups/${group.id}`);
    });
  };

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">Groups</span>
          <button onClick={() => setShowCreate(!showCreate)} className="forge-press text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {showCreate && (
          <div className="forge-card p-4 flex flex-col gap-3 mb-4" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
            <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} className="forge-input" />
            <Textarea placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="forge-input resize-none" />
            <button onClick={handleCreate} disabled={isPending} className="forge-btn-primary w-full py-2.5 text-[13px] uppercase" style={{ letterSpacing: '0.08em' }}>
              {isPending ? '...' : 'Create Group'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="forge-card flex flex-col items-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-[var(--forge-purple-bright)]" />
            </div>
            <p className="text-sm text-[var(--forge-text-primary)] font-semibold">No groups yet</p>
            <p className="text-xs text-[var(--forge-text-tertiary)] mt-1">Create the first one</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="forge-card forge-card-interactive flex items-center gap-3 px-3 py-3"
              >
                <div className="h-12 w-12 rounded-[var(--forge-radius-md)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[var(--forge-purple-bright)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--forge-text-primary)]">{group.name}</p>
                  {group.description && <p className="text-xs text-[var(--forge-text-tertiary)] line-clamp-1">{group.description}</p>}
                  <p className="text-[11px] text-[var(--forge-text-muted)] mt-0.5">{group.members_count} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
