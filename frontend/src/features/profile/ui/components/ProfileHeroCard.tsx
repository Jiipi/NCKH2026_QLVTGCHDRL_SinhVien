import React from 'react';
import { Mail, Sparkles } from 'lucide-react';
import { getAvatarGradient, getUserAvatar } from '../../../../shared/lib/avatar';
import type { ProfileTheme } from '../profileTheme';
import ProfileStatusBadge from './ProfileStatusBadge';

export interface ProfileHeroAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface ProfileHeroMetaItem {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

interface ProfileHeroCardProps {
  profile: Record<string, any> | null | undefined;
  theme: ProfileTheme;
  title?: string;
  subtitle?: string;
  roleLabel?: string;
  statusLabel?: string;
  statusActive?: boolean;
  avatarUrl?: string | null;
  metaItems?: ProfileHeroMetaItem[];
  actions?: ProfileHeroAction[];
}

export default function ProfileHeroCard({
  profile,
  theme,
  title,
  subtitle,
  roleLabel,
  statusLabel = 'Đang hoạt động',
  statusActive = true,
  avatarUrl,
  metaItems = [],
  actions = []
}: ProfileHeroCardProps) {
  const displayName = title || profile?.ho_ten || profile?.name || profile?.ten_dn || 'Người dùng';
  const avatar = getUserAvatar(profile, displayName.charAt(0).toUpperCase());
  const src = avatarUrl || avatar.src;
  const fallbackGradient = getAvatarGradient(displayName);
  const resolvedSubtitle = subtitle || profile?.email || profile?.ma_so || profile?.mssv || '';

  const buttonClass = (variant: ProfileHeroAction['variant'] = 'primary') => {
    if (variant === 'danger') return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-200';
    if (variant === 'secondary') return `border ${theme.subtleButton}`;
    return `${theme.primaryButton} text-white shadow-lg shadow-black/10`;
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md md:p-7">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.heroGradient}`} />
      <div className={`absolute -right-20 -top-24 h-60 w-60 rounded-full bg-gradient-to-br ${theme.heroGradient} opacity-10 blur-3xl`} />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 shrink-0">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.heroGradient} opacity-20 blur-md`} />
            <div className={`relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br ${fallbackGradient} text-4xl font-black text-white shadow-xl ring-4 ${theme.ring}`}>
              {src ? <img src={src} alt={avatar.alt} className="h-full w-full object-cover" /> : avatar.fallback}
            </div>
            <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-sm" />
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${theme.accentBg} ${theme.accentText} ${theme.accentBorder}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {roleLabel || theme.label}
              </span>
              <ProfileStatusBadge label={statusLabel} active={statusActive} theme={theme} />
            </div>
            <h1 className={`truncate bg-gradient-to-r ${theme.textGradient} bg-clip-text text-3xl font-black tracking-[-0.04em] text-transparent md:text-4xl`}>
              {displayName}
            </h1>
            {resolvedSubtitle && (
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4" />
                {resolvedSubtitle}
              </p>
            )}
            {metaItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {metaItems.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm">
                    {item.icon}
                    <span className="text-slate-400 dark:text-slate-500">{item.label}</span>
                    <span>{item.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass(action.variant)}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
