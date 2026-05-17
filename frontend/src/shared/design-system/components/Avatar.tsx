/**
 * Design System — Avatar Component
 *
 * @module design-system/components
 */

import React, { type HTMLAttributes } from 'react';
import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?:       string | null;
  alt?:       string;
  name?:      string;
  size?:      AvatarSize;
  status?:    AvatarStatus;
  rounded?:   boolean;
  fallback?:  React.ReactNode;
}

/* ============================================================
   Sizes
   ============================================================ */

const sizeClasses: Record<AvatarSize, string> = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs:  'w-1.5 h-1.5 border',
  sm:  'w-2 h-2 border-2',
  md:  'w-2.5 h-2.5 border-2',
  lg:  'w-3 h-3 border-2',
  xl:  'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-2',
};

const statusColors: Record<AvatarStatus, string> = {
  online:  'bg-success-500 border-white dark:border-slate-800',
  offline: 'bg-slate-400 border-white dark:border-slate-800',
  away:   'bg-warning-500 border-white dark:border-slate-800',
  busy:   'bg-danger-500 border-white dark:border-slate-800',
};

/* ============================================================
   Helpers
   ============================================================ */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarBg(name: string): string {
  const colors = [
    'bg-primary-500', 'bg-success-500', 'bg-warning-500',
    'bg-info-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-cyan-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

/* ============================================================
   Avatar Component
   ============================================================ */

export function Avatar({
  src,
  alt,
  name,
  size    = 'md',
  status,
  rounded = false,
  fallback,
  className = '',
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const initials = name ? getInitials(name) : null;
  const bgColor  = name ? getAvatarBg(name) : 'bg-slate-400';

  const containerClasses = [
    'relative inline-flex shrink-0',
    className,
  ].filter(Boolean).join(' ');

  const avatarClasses = [
    'flex items-center justify-center',
    'overflow-hidden select-none',
    'font-semibold text-white',
    'dark:text-white',
    sizeClasses[size],
    rounded ? 'rounded-full' : 'rounded-xl',
    !src || imgError ? bgColor : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={[avatarClasses, 'object-cover'].join(' ')}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={avatarClasses}>
          {fallback || initials ? (
            <span>{fallback || initials}</span>
          ) : (
            <User size={Number(sizeClasses[size].match(/h-(\d+)/)?.[1] || 10)} />
          )}
        </div>
      )}
      {status && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-white dark:border-slate-800',
            statusSizeClasses[size],
            statusColors[status],
          ].join(' ')}
        />
      )}
    </div>
  );
}

/* ============================================================
   Avatar Group
   ============================================================ */

interface AvatarGroupProps {
  children:  React.ReactNode;
  max?:     number;
  size?:    AvatarSize;
  className?: string;
}

export function AvatarGroup({ children, max, size = 'md', className = '' }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visible = max ? childArray.slice(0, max) : childArray;
  const overflow = max ? childArray.length - max : 0;

  const overlapSize: Record<AvatarSize, string> = {
    xs: '-space-x-1',
    sm: '-space-x-1.5',
    md: '-space-x-2',
    lg: '-space-x-2.5',
    xl: '-space-x-3',
    '2xl': '-space-x-4',
  };

  return (
    <div className={['flex items-center', overlapSize[size], className].join(' ')}>
      {visible}
      {overflow > 0 && (
        <div
          className={[
            'flex items-center justify-center rounded-full',
            'bg-slate-200 text-slate-600 font-semibold',
            'border-2 border-white dark:border-slate-800',
            'dark:bg-slate-700 dark:text-slate-300',
            sizeClasses[size],
          ].join(' ')}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
