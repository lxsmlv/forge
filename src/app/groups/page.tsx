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
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">Groups</span>
          <button onClick={() => setShowCreate(!showCreate)} className="text-purple-400 hover:text-purple-300 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {showCreate && (
          <div className="bg-zinc-950 border border-purple-600/30 rounded-xl p-4 flex flex-col gap-3 mb-4">
            <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30" />
            <Textarea placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30 resize-none" />
            <Button onClick={handleCreate} disabled={isPending} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
              {isPending ? '...' : 'Create Group'}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-zinc-600">
            <Users className="w-8 h-8 mb-2 text-zinc-700" />
            <p className="text-sm">No groups yet</p>
            <p className="text-xs text-zinc-700 mt-1">Create the first one</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-purple-600/30 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-600/20 border border-purple-600/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{group.name}</p>
                  {group.description && <p className="text-xs text-zinc-600 line-clamp-1">{group.description}</p>}
                  <p className="text-xs text-zinc-700 mt-0.5">{group.members_count} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
