'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGroupById, joinGroup, leaveGroup } from '@/features/groups/actions';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getGroupById(groupId).then((data) => {
      setGroup(data);
      setIsMember(data?.is_member || false);
      setMembersCount(data?.members_count || 0);
      setLoading(false);
    });
  }, [groupId]);

  const handleToggleMembership = () => {
    setIsMember(!isMember);
    setMembersCount(isMember ? membersCount - 1 : membersCount + 1);
    startTransition(async () => {
      if (isMember) await leaveGroup(groupId);
      else await joinGroup(groupId);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500">
        <p>Group not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">{group.name}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="h-20 w-20 rounded-2xl bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{group.name}</h2>
          {group.description && <p className="text-sm text-zinc-500 text-center">{group.description}</p>}
          <p className="text-xs text-zinc-600">{membersCount} members</p>

          <Button
            onClick={handleToggleMembership}
            disabled={isPending}
            className={`px-6 font-bold transition-all ${
              isMember
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
            }`}
          >
            {isMember ? (
              <><UserMinus className="w-4 h-4 mr-2" />Leave</>
            ) : (
              <><UserPlus className="w-4 h-4 mr-2" />Join</>
            )}
          </Button>
        </div>

        <div className="flex flex-col items-center py-12 text-zinc-600">
          <p className="text-sm">Group feed coming soon</p>
        </div>
      </main>
    </div>
  );
}
