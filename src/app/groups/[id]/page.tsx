'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, UserMinus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/features/feed/PostCard';
import { getGroupById, joinGroup, leaveGroup, getGroupPosts } from '@/features/groups/actions';
import { toast } from 'sonner';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([getGroupById(groupId), getGroupPosts(groupId)]).then(([g, p]) => {
      setGroup(g);
      setPosts(p);
      setIsMember(g?.is_member || false);
      setMembersCount(g?.members_count || 0);
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
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/groups/${groupId}`);
              toast('Group link copied');
            }}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center">
            <Users className="w-7 h-7 text-purple-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">{group.name}</h2>
            {group.description && <p className="text-sm text-zinc-500 mt-1">{group.description}</p>}
            <p className="text-xs text-zinc-600 mt-1">{membersCount} members</p>
          </div>

          <Button
            onClick={handleToggleMembership}
            disabled={isPending}
            size="sm"
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

        {posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-zinc-600">
            <p className="text-sm">No posts in this group yet</p>
            <p className="text-xs text-zinc-700 mt-1">Share a post to this group to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
