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
      <div className="min-h-screen bg-[var(--forge-black)] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-[var(--forge-error)]">Admin Panel</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="forge-card p-4 flex flex-col items-center">
            <Users className="w-5 h-5 text-[var(--forge-purple-bright)] mb-1" />
            <span className="text-2xl font-bold text-[var(--forge-text-primary)] tabular-nums">{stats.users}</span>
            <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Users</span>
          </div>
          <div className="forge-card p-4 flex flex-col items-center">
            <FileText className="w-5 h-5 text-[var(--forge-purple-bright)] mb-1" />
            <span className="text-2xl font-bold text-[var(--forge-text-primary)] tabular-nums">{stats.posts}</span>
            <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Posts</span>
          </div>
          <div className="forge-card p-4 flex flex-col items-center">
            <Flag className="w-5 h-5 text-[var(--forge-error)] mb-1" />
            <span className="text-2xl font-bold text-[var(--forge-text-primary)] tabular-nums">{stats.reports}</span>
            <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Reports</span>
          </div>
          <div className="forge-card p-4 flex flex-col items-center">
            <Layers className="w-5 h-5 text-[var(--forge-purple-bright)] mb-1" />
            <span className="text-2xl font-bold text-[var(--forge-text-primary)] tabular-nums">{stats.groups}</span>
            <span className="text-[11px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">Groups</span>
          </div>
        </div>

        <h3 className="text-[11px] font-semibold text-[var(--forge-text-secondary)] mb-3 uppercase tracking-wider">Reports</h3>
        {reports.length === 0 ? (
          <div className="forge-card flex flex-col items-center py-12 px-6 text-center">
            <p className="text-sm text-[var(--forge-text-tertiary)]">No reports</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reports.map((r) => (
              <div key={r.id} className="forge-card p-3" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs text-[var(--forge-text-secondary)] truncate">
                    @{r.reporter?.username} reported @{r.post?.author?.username}
                  </span>
                  <button
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
                    className="forge-press shrink-0 flex items-center gap-1 text-[11px] text-[var(--forge-error)] hover:bg-red-900/20 px-2 py-1 rounded-[var(--forge-radius-sm)] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
                <p className="text-xs text-[var(--forge-text-tertiary)]">Reason: {r.reason}</p>
                {r.post?.caption && <p className="text-xs text-[var(--forge-text-secondary)] mt-1 truncate">"{r.post.caption}"</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
