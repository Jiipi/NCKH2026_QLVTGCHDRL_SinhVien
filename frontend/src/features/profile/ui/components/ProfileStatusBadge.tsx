import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import type { ProfileTheme } from '../profileTheme';

interface ProfileStatusBadgeProps {
  label: string;
  active?: boolean;
  theme: ProfileTheme;
  className?: string;
}

export default function ProfileStatusBadge({ label, active = true, theme, className = '' }: ProfileStatusBadgeProps) {
  const Icon = active ? CheckCircle2 : ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${active ? `${theme.accentBg} ${theme.accentText} ${theme.accentBorder}` : 'border-rose-200 bg-rose-50 text-rose-700'} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
