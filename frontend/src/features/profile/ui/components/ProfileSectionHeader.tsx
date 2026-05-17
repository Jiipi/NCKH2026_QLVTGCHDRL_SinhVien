import React from 'react';
import type { ProfileTheme } from '../profileTheme';

interface ProfileSectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  theme: ProfileTheme;
  className?: string;
}

export default function ProfileSectionHeader({ title, icon, action, theme, className = '' }: ProfileSectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${theme.accentBg} ${theme.accentText} ${theme.accentBorder}`}>
            {icon}
          </div>
        )}
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-black transition-all duration-200 hover:-translate-y-0.5 ${theme.subtleButton}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
