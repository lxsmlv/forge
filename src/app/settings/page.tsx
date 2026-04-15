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
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">{t('settings.title')}</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Change password */}
        <div className="forge-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--forge-text-primary)]">
            <Lock className="w-4 h-4 text-[var(--forge-purple-bright)]" />
            {t('settings.change_password')}
          </div>
          <Input
            type="password"
            placeholder={t('settings.new_password')}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(''); }}
            className="forge-input"
          />
          <Input
            type="password"
            placeholder={t('settings.confirm_password')}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
            className="forge-input"
          />
          {passwordMsg && (
            <p className={`text-[13px] ${passwordMsg === 'Password changed' ? 'text-[var(--forge-success)]' : 'text-[var(--forge-error)]'}`}>
              {passwordMsg}
            </p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="forge-btn-primary w-full py-2.5 text-[13px] uppercase disabled:opacity-50"
            style={{ letterSpacing: '0.08em' }}
          >
            {passwordLoading ? '...' : t('settings.update_password')}
          </button>
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="forge-card forge-card-interactive p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 text-sm text-[var(--forge-text-secondary)]">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-[var(--forge-purple-bright)]" /> : <Sun className="w-4 h-4 text-[var(--forge-purple-bright)]" />}
            {t('settings.theme')}
          </div>
          <span className="text-xs text-[var(--forge-text-tertiary)]">{t('settings.theme_switch')}</span>
        </button>

        {/* Push Notifications */}
        <button
          onClick={async () => {
            const ok = await subscribe();
            if (ok) alert('Push notifications enabled!');
          }}
          disabled={permission === 'granted'}
          className="forge-card forge-card-interactive p-4 flex items-center justify-between disabled:opacity-60"
        >
          <div className="flex items-center gap-3 text-sm text-[var(--forge-text-secondary)]">
            <Bell className="w-4 h-4 text-[var(--forge-purple-bright)]" />
            Push
          </div>
          <span className="text-xs text-[var(--forge-text-tertiary)]">
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
          className="forge-card forge-card-interactive p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 text-sm text-[var(--forge-text-secondary)]">
            <Globe className="w-4 h-4 text-[var(--forge-purple-bright)]" />
            {locale === 'en' ? 'English' : 'Русский'}
          </div>
          <span className="text-xs text-[var(--forge-text-tertiary)]">{t('settings.theme_switch')}</span>
        </button>

        {/* Admin */}
        {showAdmin && (
          <Link
            href="/admin"
            className="forge-card forge-card-interactive p-4 flex items-center gap-3 text-sm text-[var(--forge-error)] hover:text-red-300 transition-colors"
            style={{ borderColor: 'rgba(248,113,113,0.2)' }}
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
          className="forge-card forge-card-interactive p-4 flex items-center gap-3 text-sm text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)]"
        >
          <Download className="w-4 h-4 text-[var(--forge-purple-bright)]" />
          {t('settings.export')}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="forge-card forge-card-interactive p-4 flex items-center gap-3 text-sm text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)]"
        >
          <LogOut className="w-4 h-4 text-[var(--forge-purple-bright)]" />
          {t('settings.signout')}
        </button>

        {/* Delete account */}
        <div className="forge-card p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--forge-error)]">
            <Trash2 className="w-4 h-4" />
            {t('settings.danger')}
          </div>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="forge-press text-[13px] py-2 rounded-[var(--forge-radius-md)] text-[var(--forge-error)] hover:bg-red-900/20 transition-colors"
            >
              {t('settings.delete_account')}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--forge-text-secondary)]">{t('settings.delete_confirm')}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="forge-press flex-1 py-2.5 rounded-[var(--forge-radius-md)] bg-[var(--forge-error)] hover:brightness-110 text-white font-bold text-[13px] disabled:opacity-50 transition-all"
                >
                  {deleteLoading ? '...' : t('settings.delete_yes')}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="forge-btn-secondary flex-1 py-2.5 text-[13px]"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
