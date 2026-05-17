/**
 * Design System — Skeleton Loading Component
 *
 * @module design-system/components
 */

import React, { type HTMLAttributes } from 'react';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?:  SkeletonVariant;
  width?:    string | number;
  height?:   string | number;
  duration?: number;
}

export function Skeleton({
  variant   = 'text',
  width,
  height,
  className = '',
  ...props
}: SkeletonProps) {
  const variantClasses: Record<SkeletonVariant, string> = {
    text:        'rounded',
    circular:    'rounded-full',
    rectangular: 'rounded-none',
    rounded:     'rounded-xl',
  };

  const defaultHeight: Record<SkeletonVariant, string> = {
    text:        '1em',
    circular:    '2rem',
    rectangular: '3rem',
    rounded:     '1.5rem',
  };

  const w = typeof width === 'number' ? `${width}px` : width;
  const h = typeof height === 'number' ? `${height}px` : (height || defaultHeight[variant]);

  return (
    <div
      className={[
        'bg-slate-200 dark:bg-slate-700',
        'animate-pulse',
        'overflow-hidden',
        'relative',
        'after:absolute after:inset-0',
        'after:bg-gradient-to-r',
        'after:from-transparent after:via-white/40 after:to-transparent',
        'after:dark:via-slate-600/40',
        'after:animate-shimmer',
        variantClasses[variant],
        className,
      ].join(' ')}
      style={{ width: w || undefined, height: h }}
      {...props}
    />
  );
}

/* ============================================================
   Skeleton Card
   ============================================================ */

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={['rounded-2xl border border-border-default bg-surface-card p-4', className].join(' ')}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={16} className="w-3/4" />
          <Skeleton variant="text" height={12} className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-5/6" />
        <Skeleton variant="text" height={14} className="w-2/3" />
      </div>
    </div>
  );
}

/* ============================================================
   Skeleton Table Row
   ============================================================ */

interface SkeletonTableRowProps {
  columns?:  number;
  cellHeight?: number;
}

export function SkeletonTableRow({ columns = 5, cellHeight = 16 }: SkeletonTableRowProps) {
  return (
    <tr className="border-b border-border-default last:border-b-0">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            variant="text"
            height={cellHeight}
            className={i === 0 ? 'w-3/4' : i === columns - 1 ? 'w-1/3' : 'w-full'}
          />
        </td>
      ))}
    </tr>
  );
}

/* ============================================================
   Loading Spinner
   ============================================================ */

interface SpinnerProps {
  size?:    'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?:   'primary' | 'white' | 'muted';
  className?: string;
}

const spinnerSizes = {
  xs:  'w-4 h-4 border-[2px]',
  sm:  'w-5 h-5 border-2',
  md:  'w-8 h-8 border-2',
  lg:  'w-12 h-12 border-[3px]',
  xl:  'w-16 h-16 border-4',
};

const spinnerColors = {
  primary: 'border-primary-200 border-t-primary-600',
  white:   'border-white/30 border-t-white',
  muted:  'border-slate-200 border-t-slate-500 dark:border-slate-700 dark:border-t-slate-400',
};

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  return (
    <div
      className={[
        'rounded-full animate-spin',
        spinnerSizes[size],
        spinnerColors[color],
        className,
      ].join(' ')}
      role="status"
      aria-label="Đang tải"
    >
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}

/* ============================================================
   Loading Screen (full page)
   ============================================================ */

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = 'Đang tải...', fullScreen = true }: LoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" color="primary" />
      {message && (
        <p className="text-sm text-text-muted font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-page/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

/* ============================================================
   Page Loading Skeleton
   ============================================================ */

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" height={28} className="w-48" />
          <Skeleton variant="text" height={16} className="w-32" />
        </div>
        <Skeleton variant="rounded" width={120} height={36} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>

      {/* Table */}
      <Skeleton variant="rounded" height={400} />
    </div>
  );
}
