'use client';

import { useState } from 'react';
import { ArrowLeft, Lock, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Settings() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg(error.message);
    } else {
      setPasswordMsg('Password changed');
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const res = await fetch('/api/delete-account', { method: 'POST' });
    if (res.ok) {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/';
    } else {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">Settings</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Change password */}
        <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Lock className="w-4 h-4 text-purple-400" />
            Change password
          </div>
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(''); }}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg === 'Password changed' ? 'text-green-400' : 'text-red-400'}`}>
              {passwordMsg}
            </p>
          )}
          <Button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
          >
            {passwordLoading ? '...' : 'Update password'}
          </Button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        {/* Delete account */}
        <div className="bg-zinc-950 border border-red-900/30 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-red-400">
            <Trash2 className="w-4 h-4" />
            Danger zone
          </div>
          {!deleteConfirm ? (
            <Button
              onClick={() => setDeleteConfirm(true)}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              Delete my account
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-500">This will permanently delete your account, posts, notes, and all data. This cannot be undone.</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, delete everything'}
                </Button>
                <Button onClick={() => setDeleteConfirm(false)} variant="ghost" className="text-zinc-500 hover:text-white">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
