import React from 'react';
import type { ProfileTheme } from '../profileTheme';

interface ProfileShellProps {
  theme: ProfileTheme;
  children: React.ReactNode;
  className?: string;
}

export default function ProfileShell({ theme, children, className = '' }: ProfileShellProps) {
  return (
    <div className={`min-h-full w-full bg-gray-50 ${className}`} data-profile-role={theme.key}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}
