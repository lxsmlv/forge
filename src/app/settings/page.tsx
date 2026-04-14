'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Trash2, LogOut, Shield, Sun, Moon, Download, Globe, Bell } from 'lucide-react';
import { useT } from '@/lib/useT';
import { usePushNotifications } from '@/features/push/usePushNotifications';
import { getLocale, setLocale, type Locale } from '@/lib/i18n';
import { exportUserData } from '@/features/profile/block-actions';
import { useTheme } from '@/features/theme/ThemeProvider';
import Link from 'next/link';
import { isAdmin } from '@/features/admin/actions';
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
  const [showAdmin, setShowAdmin] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { permission, subscribe } = usePushNotifications();
  const t = useT();
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => { setLocaleState(getLocale()); }, []);

  useEffect(() => { isAdmin().then(setShowAdmin); }, []);

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
          <span className="text-sm font-medium text-zinc-400">{t('settings.title')}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Change password */}
        <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Lock className="w-4 h-4 text-purple-400" />
            {t('settings.change_password')}
          </div>
          <Input
            type="password"
            placeholder={t('settings.new_password')}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(''); }}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
          />
          <Input
            type="password"
            placeholder={t('settings.confirm_password')}
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
            {passwordLoading ? '...' : t('settings.update_password')}
          </Button>
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {t('settings.theme')}
          </div>
          <span className="text-xs text-zinc-600">{t('settings.theme_switch')}</span>
        </button>

        {/* Push Notifications */}
        <button
          onClick={async () => {
            const ok = await subscribe();
            if (ok) alert('Push notifications enabled!');
          }}
          disabled={permission === 'granted'}
          className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Bell className="w-4 h-4" />
            Push
          </div>
          <span className="text-xs text-zinc-600">
            {permission === 'granted' ? '✓' : permission === 'denied' ? '✕' : t('settings.theme_switch')}
          </span>
        </button>

        {/* Language */}
        <button
          onClick={() => {
            const next: Locale = locale === 'en' ? 'ru' : 'en';
            setLocale(next);
            setLocaleState(next);
            window.location.reload();
          }}
          className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Globe className="w-4 h-4" />
            {locale === 'en' ? 'English' : 'Русский'}
          </div>
          <span className="text-xs text-zinc-600">{t('settings.theme_switch')}</span>
        </button>

        {/* Admin */}
        {showAdmin && (
          <Link
            href="/admin"
            className="bg-zinc-950 border border-red-900/30 rounded-xl p-4 flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:border-red-900/50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Admin Panel
          </Link>
        )}

        {/* Export Data */}
        <button
          onClick={async () => {
            const data = await exportUserData();
            if (data) {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'forge-data-export.json';
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('settings.export')}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('settings.signout')}
        </button>

        {/* Delete account */}
        <div className="bg-zinc-950 border border-red-900/30 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-red-400">
            <Trash2 className="w-4 h-4" />
            {t('settings.danger')}
          </div>
          {!deleteConfirm ? (
            <Button
              onClick={() => setDeleteConfirm(true)}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              {t('settings.delete_account')}
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-500">{t('settings.delete_confirm')}</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold disabled:opacity-50"
                >
                  {deleteLoading ? '...' : t('settings.delete_yes')}
                </Button>
                <Button onClick={() => setDeleteConfirm(false)} variant="ghost" className="text-zinc-500 hover:text-white">
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
