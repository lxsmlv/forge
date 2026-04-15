'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  title: string;
  loadUsers: () => Promise<any[]>;
}

export function UserList({ title, loadUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, [loadUsers]);

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">{title}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-[var(--forge-text-tertiary)] py-20">No one yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((user) => {
              const initials = user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="forge-card forge-card-interactive flex items-center gap-3 px-3 py-3"
                >
                  <div className="forge-avatar h-10 w-10 rounded-full bg-[var(--forge-purple-glow)] flex items-center justify-center text-sm font-bold text-[var(--forge-purple-bright)] overflow-hidden shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--forge-text-primary)] truncate">{user.full_name}</p>
                    <p className="text-xs text-[var(--forge-text-tertiary)] truncate">@{user.username}{user.city ? ` · ${user.city}` : ''}{user.car ? ` · ${user.car}` : ''}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
