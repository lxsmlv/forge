'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, FileText, Flag, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAdmin, getReports, getAdminStats, deletePostAdmin } from '@/features/admin/actions';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, posts: 0, reports: 0, groups: 0 });
  const [reports, setReports] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    isAdmin().then((ok) => {
      if (!ok) { router.push('/feed'); return; }
      setAuthorized(true);
      Promise.all([getAdminStats(), getReports()]).then(([s, r]) => {
        setStats(s);
        setReports(r);
        setLoading(false);
      });
    });
  }, [router]);

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
          <span className="text-sm font-medium text-red-400">Admin Panel</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center">
            <Users className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-2xl font-bold text-white">{stats.users}</span>
            <span className="text-xs text-zinc-600">Users</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center">
            <FileText className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-2xl font-bold text-white">{stats.posts}</span>
            <span className="text-xs text-zinc-600">Posts</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center">
            <Flag className="w-5 h-5 text-red-400 mb-1" />
            <span className="text-2xl font-bold text-white">{stats.reports}</span>
            <span className="text-xs text-zinc-600">Reports</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col items-center">
            <Layers className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-2xl font-bold text-white">{stats.groups}</span>
            <span className="text-xs text-zinc-600">Groups</span>
          </div>
        </div>

        <h3 className="text-sm font-medium text-zinc-400 mb-3">Reports</h3>
        {reports.length === 0 ? (
          <p className="text-center text-sm text-zinc-600 py-8">No reports</p>
        ) : (
          <div className="flex flex-col gap-2">
            {reports.map((r) => (
              <div key={r.id} className="bg-zinc-950 border border-red-900/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">
                    @{r.reporter?.username} reported @{r.post?.author?.username}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      startTransition(async () => {
                        if (r.post?.id) {
                          await deletePostAdmin(r.post.id);
                          toast('Post deleted');
                          const updated = await getReports();
                          setReports(updated);
                          const s = await getAdminStats();
                          setStats(s);
                        }
                      });
                    }}
                    disabled={isPending}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete post
                  </Button>
                </div>
                <p className="text-xs text-zinc-600">Reason: {r.reason}</p>
                {r.post?.caption && <p className="text-xs text-zinc-500 mt-1 truncate">"{r.post.caption}"</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
