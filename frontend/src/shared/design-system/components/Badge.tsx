/**
 * Design System — Badge Component
 *
 * @module design-system/components
 */

import React, { type HTMLAttributes } from 'react';

type BadgeVariant = 'solid' | 'soft' | 'outline';
type BadgeColor  = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'slate' | 'neutral';
type BadgeSize   = 'xs' | 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:    BadgeVariant;
  color?:      BadgeColor;
  size?:       BadgeSize;
  dot?:        boolean;
  leftIcon?:   React.ReactNode;
}

/* ============================================================
   Color Maps
   ============================================================ */

const colorMaps: Record<BadgeColor, Record<BadgeVariant, { bg: string; text: string; border: string }>> = {
  primary: {
    solid:   { bg: 'bg-primary-600',    text: 'text-white',                   border: 'border-transparent' },
    soft:    { bg: 'bg-primary-50',     text: 'text-primary-700',              border: 'border-transparent' },
    outline: { bg: 'bg-transparent',    text: 'text-primary-600',              border: 'border-primary-300' },
  },
  success: {
    solid:   { bg: 'bg-success-600',    text: 'text-white',                   border: 'border-transparent' },
    soft:    { bg: 'bg-success-50',     text: 'text-success-700',             border: 'border-transparent' },
    outline: { bg: 'bg-transparent',    text: 'text-success-600',              border: 'border-success-300' },
  },
  danger: {
    solid:   { bg: 'bg-red-500',       text: 'text-white',                   border: 'border-transparent' },
    soft:    { bg: 'bg-red-50',        text: 'text-red-700',                  border: 'border-transparent' },
    outline: { bg: 'bg-transparent',    text: 'text-red-600',                  border: 'border-red-300' },
  },
  warning: {
    solid:   { bg: 'bg-amber-500',      text: 'text-white',                   border: 'border-transparent' },
    soft:    { bg: 'bg-amber-50',       text: 'text-amber-700',               border: 'border-transparent' },
    outline: { bg: 'bg-transparent',    text: 'text-amber-600',               border: 'border-amber-300' },
  },
  info: {
    solid:   { bg: 'bg-sky-500',       text: 'text-white',                   border: 'border-transparent' },
    soft:    { bg: 'bg-sky-50',        text: 'text-sky-700',                  border: 'border-transparent' },
    outline: { bg: 'bg-transparent',    text: 'text-sky-600',                 border: 'border-sky-300' },
  },
  slate: {
    solid:   { bg: 'bg-slate-600',     text: 'text-white',                   border: 'border-transparent' },
    soft:    { bg: 'bg-slate-100',     text: 'text-slate-700',               border: 'border-transparent' },
    outline: { bg: 'bg-transparent',   text: 'text-slate-600',               border: 'border-slate-300' },
  },
  neutral: {
    solid:   { bg: 'bg-slate-500',     text: 'text-white',                   border: 'border-transparent' },
    soft:    { bg: 'bg-slate-100',     text: 'text-slate-600',               border: 'border-transparent' },
    outline: { bg: 'bg-transparent',    text: 'text-slate-500',               border: 'border-slate-300' },
  },
};

/* Dark mode overrides for soft variants */
const darkSoft: Record<BadgeColor, { bg: string; text: string }> = {
  primary: { bg: 'dark:bg-primary-900/40', text: 'dark:text-primary-300' },
  success: { bg: 'dark:bg-success-900/40', text: 'dark:text-success-300' },
  danger:  { bg: 'dark:bg-red-900/40',     text: 'dark:text-red-300' },
  warning: { bg: 'dark:bg-amber-900/40',   text: 'dark:text-amber-300' },
  info:    { bg: 'dark:bg-sky-900/40',    text: 'dark:text-sky-300' },
  slate:   { bg: 'dark:bg-slate-800',      text: 'dark:text-slate-300' },
  neutral: { bg: 'dark:bg-slate-800',      text: 'dark:text-slate-300' },
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-xs gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

const dotSizeClasses: Record<BadgeSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export function Badge({
  variant  = 'soft',
  color    = 'primary',
  size     = 'sm',
  dot      = false,
  leftIcon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const map = colorMaps[color][variant];

  const classes = [
    'inline-flex items-center font-medium rounded-full',
    sizeClasses[size],
    map.bg,
    map.text,
    map.border,
    variant === 'outline' ? 'border' : '',
    variant === 'soft' && darkSoft[color] ? `${darkSoft[color].bg} ${darkSoft[color].text}` : '',
    className,
  ].filter(Boolean).join(' ');

  const dotColors: Record<BadgeColor, string> = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    danger:  'bg-red-500',
    warning: 'bg-amber-500',
    info:    'bg-sky-500',
    slate:   'bg-slate-500',
    neutral: 'bg-slate-400',
  };

  return (
    <span className={classes} {...props}>
      {dot && (
        <span className={['rounded-full shrink-0', dotSizeClasses[size], dotColors[color]].join(' ')} />
      )}
      {leftIcon}
      {children}
    </span>
  );
}

/* ============================================================
   Status Badge (convenience)
   ============================================================ */

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'draft' | 'cancelled' | 'completed';
  label?: string;
  size?:  BadgeSize;
}

const statusConfig: Record<string, { color: BadgeColor; defaultLabel: string }> = {
  pending:    { color: 'warning', defaultLabel: 'Chờ duyệt' },
  approved:   { color: 'success', defaultLabel: 'Đã duyệt' },
  rejected:   { color: 'danger',  defaultLabel: 'Từ chối' },
  active:    { color: 'success', defaultLabel: 'Hoạt động' },
  inactive:  { color: 'slate',   defaultLabel: 'Không hoạt động' },
  draft:     { color: 'slate',   defaultLabel: 'Bản nháp' },
  cancelled:  { color: 'danger',  defaultLabel: 'Đã hủy' },
  completed:  { color: 'info',   defaultLabel: 'Hoàn thành' },
};

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'neutral' as BadgeColor, defaultLabel: status };
  return (
    <Badge color={config.color} size={size} dot>
      {label || config.defaultLabel}
    </Badge>
  );
}
