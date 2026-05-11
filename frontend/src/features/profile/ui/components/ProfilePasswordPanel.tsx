import React from 'react';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';
import type { ProfileTheme } from '../profileTheme';

interface ProfilePasswordPanelProps {
  onSubmit: (event: React.FormEvent) => void;
  passwordData: Record<string, string>;
  setPasswordData: (data: Record<string, string>) => void;
  showPasswords: Record<string, boolean>;
  setShowPasswords: (data: Record<string, boolean>) => void;
  theme: ProfileTheme;
  loading?: boolean;
  title?: string;
}

export default function ProfilePasswordPanel({
  onSubmit,
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  theme,
  loading = false,
  title = 'Bảo mật tài khoản'
}: ProfilePasswordPanelProps) {
  const fields = [
    { key: 'currentPassword', fallbackKey: 'old_password', label: 'Mật khẩu hiện tại' },
    { key: 'newPassword', fallbackKey: 'new_password', label: 'Mật khẩu mới' },
    { key: 'confirmPassword', fallbackKey: 'confirm_password', label: 'Xác nhận mật khẩu mới' }
  ];

  const getValue = (key: string, fallbackKey: string) => passwordData[key] ?? passwordData[fallbackKey] ?? '';
  const setValue = (key: string, fallbackKey: string, value: string) => {
    const next = { ...passwordData, [key]: value };
    if (fallbackKey in passwordData) next[fallbackKey] = value;
    setPasswordData(next);
  };

  const toggle = (key: string) => setShowPasswords({ ...showPasswords, [key]: !showPasswords[key] });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-2xl border p-3 ${theme.accentBg} ${theme.accentText} ${theme.accentBorder}`}>
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => {
          const visible = !!showPasswords[field.key];
          return (
            <label key={field.key} className="block">
              <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{field.label}</span>
              <div className="relative">
                <input
                  type={visible ? 'text' : 'password'}
                  value={getValue(field.key, field.fallbackKey)}
                  onChange={(event) => setValue(field.key, field.fallbackKey, event.target.value)}
                  disabled={loading}
                  className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-12 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all focus:border-transparent focus:ring-4 disabled:opacity-60 ${theme.ring}`}
                />
                <button type="button" onClick={() => toggle(field.key)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200">
                  {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>
          );
        })}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading} className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-black text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${theme.primaryButton}`}>
            <Save className="h-4 w-4" />
            {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </section>
  );
}
