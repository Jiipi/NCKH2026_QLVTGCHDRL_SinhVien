/**
 * Design System — Alert & Feedback Components
 *
 * @module design-system/components
 */

import React, { type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from 'lucide-react';

/* ============================================================
   Alert
   ============================================================ */

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  variant?:  AlertVariant;
  title?:   string;
  children?: ReactNode;
  icon?:    ReactNode;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

const alertConfig: Record<AlertVariant, { bg: string; border: string; iconBg: string; iconColor: string }> = {
  info: {
    bg:       'bg-info-50 dark:bg-info-950/30',
    border:   'border-info-200 dark:border-info-800',
    iconBg:   'bg-info-100 dark:bg-info-900/50',
    iconColor:'text-info-600 dark:text-info-400',
  },
  success: {
    bg:       'bg-success-50 dark:bg-success-950/30',
    border:   'border-success-200 dark:border-success-800',
    iconBg:   'bg-success-100 dark:bg-success-900/50',
    iconColor:'text-success-600 dark:text-success-400',
  },
  warning: {
    bg:       'bg-warning-50 dark:bg-warning-950/30',
    border:   'border-warning-200 dark:border-warning-800',
    iconBg:   'bg-warning-100 dark:bg-warning-900/50',
    iconColor:'text-warning-600 dark:text-warning-400',
  },
  danger: {
    bg:       'bg-danger-50 dark:bg-danger-950/30',
    border:   'border-danger-200 dark:border-danger-800',
    iconBg:   'bg-danger-100 dark:bg-danger-900/50',
    iconColor:'text-danger-600 dark:text-danger-400',
  },
};

const defaultIcons: Record<AlertVariant, React.ElementType> = {
  info:    Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger:  XCircle,
};

export function Alert({
  variant   = 'info',
  title,
  children,
  icon,
  closable,
  onClose,
  className = '',
}: AlertProps) {
  const config = alertConfig[variant];
  const DefaultIcon = defaultIcons[variant];

  return (
    <div
      className={[
        'flex gap-3 p-4 rounded-xl border',
        config.bg,
        config.border,
        className,
      ].join(' ')}
      role="alert"
    >
      <div className={[
        'shrink-0 flex items-center justify-center',
        'w-8 h-8 rounded-lg',
        config.iconBg,
      ].join(' ')}>
        {(icon || <DefaultIcon size={16} className={config.iconColor} />)}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-text-primary mb-0.5">
            {title}
          </h4>
        )}
        {children && (
          <div className="text-sm text-text-secondary">
            {children}
          </div>
        )}
      </div>
      {closable && onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-text-muted hover:bg-black/5 dark:hover:bg-white/5"
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  );
}

/* ============================================================
   Empty State
   ============================================================ */

interface EmptyStateProps {
  icon?:    ReactNode;
  title:   string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={['flex flex-col items-center justify-center py-16 text-center', className].join(' ')}>
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-surface-muted">
        {icon || (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

/* ============================================================
   Progress Bar
   ============================================================ */

interface ProgressProps {
  value:    number;
  max?:     number;
  size?:    'sm' | 'md' | 'lg';
  color?:   'primary' | 'success' | 'danger' | 'warning' | 'info';
  showLabel?: boolean;
  label?:   string;
  className?: string;
}

const progressColors: Record<string, string> = {
  primary:  'bg-primary-500',
  success:  'bg-success-500',
  danger:   'bg-red-500',
  warning:  'bg-amber-500',
  info:     'bg-sky-500',
};

const progressSizes: Record<string, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function Progress({
  value,
  max       = 100,
  size      = 'md',
  color     = 'primary',
  showLabel = false,
  label,
  className = '',
}: ProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={['w-full', className].join(' ')}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          {showLabel && (
            <span className="text-xs font-medium text-text-muted">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div className={['w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden', progressSizes[size]].join(' ')}>
        <div
          className={['h-full rounded-full transition-all duration-500 ease-out', progressColors[color]].join(' ')}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Tooltip
   ============================================================ */

interface TooltipProps {
  children: React.ReactElement;
  content:  string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const tooltipPositions: Record<string, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ children, content, position = 'top', className = '' }: TooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={[
          'absolute z-50 px-2 py-1',
          'text-xs font-medium text-white dark:text-slate-100',
          'bg-slate-900 dark:bg-slate-700',
          'rounded-lg shadow-lg',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-150',
          'whitespace-nowrap pointer-events-none',
          tooltipPositions[position],
          className,
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  );
}
