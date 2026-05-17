/**
 * Design System — Card Component
 *
 * Quy tắc:
 * - Luôn có border + rounded-xl (border-radius 12px)
 * - Card header: tách riêng bằng border-bottom
 * - Hover effect: shadow-md khi có onClick
 *
 * @module design-system/components
 */

import React, { type HTMLAttributes, type ReactNode } from 'react';

type CardVariant = 'elevated' | 'outlined' | 'ghost' | 'filled';
type CardSize   = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?:      CardVariant;
  size?:         CardSize;
  padding?:      'none' | 'sm' | 'md' | 'lg';
  hoverable?:    boolean;
  header?:       ReactNode;
  footer?:       ReactNode;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?:        string;
  subtitle?:     string;
  action?:       ReactNode;
  padding?:      'none' | 'sm' | 'md' | 'lg';
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/* ============================================================
   Variant Classes
   ============================================================ */

const variantClasses: Record<CardVariant, string> = {
  elevated: 'bg-surface-card border border-transparent shadow-sm',
  outlined: 'bg-surface-card border border-border-default',
  ghost:    'bg-transparent border border-transparent',
  filled:   'bg-surface-muted border border-transparent',
};

const paddingClasses: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

const sizeClasses: Record<CardSize, string> = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
};

/* ============================================================
   Card Component
   ============================================================ */

export function Card({
  variant      = 'outlined',
  size         = 'md',
  padding      = 'md',
  hoverable    = false,
  header,
  footer,
  children,
  className    = '',
  ...props
}: CardProps) {
  const classes = [
    sizeClasses[size],
    variantClasses[variant],
    hoverable ? 'cursor-pointer transition-shadow duration-200 hover:shadow-md' : '',
    className,
  ].filter(Boolean).join(' ');

  const bodyPadding = padding;

  return (
    <div className={classes} {...props}>
      {header && (
        typeof header === 'string'
          ? <CardHeader>{header}</CardHeader>
          : header
      )}
      <CardBody padding={bodyPadding}>{children}</CardBody>
      {footer && (
        typeof footer === 'string'
          ? <CardFooter>{footer}</CardFooter>
          : footer
      )}
    </div>
  );
}

/* ============================================================
   Card Header
   ============================================================ */

export function CardHeader({
  title,
  subtitle,
  action,
  padding   = 'md',
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  const hasCustomChildren = !!children;

  return (
    <div
      className={[
        'flex items-center justify-between',
        'border-b border-border-default',
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {hasCustomChildren ? children : (
        <div className="flex flex-col gap-0.5 min-w-0">
          {title && (
            <h3 className="text-base font-semibold text-text-primary truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-muted truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

/* ============================================================
   Card Body
   ============================================================ */

export function CardBody({
  padding   = 'md',
  children,
  className = '',
  ...props
}: CardBodyProps) {
  return (
    <div
      className={[paddingClasses[padding], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Card Footer
   ============================================================ */

export function CardFooter({
  padding   = 'md',
  children,
  className = '',
  ...props
}: CardFooterProps) {
  return (
    <div
      className={[
        'flex items-center justify-end gap-2',
        'border-t border-border-default',
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Stat Card (cho dashboard)
   ============================================================ */

interface StatCardProps {
  label:        string;
  value:        string | number;
  icon?:        ReactNode;
  trend?:       { value: number; label?: string };
  colorScheme?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  className?:   string;
}

const colorMap = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  danger:  'bg-danger-50  text-danger-600  dark:bg-red-900/30    dark:text-red-400',
  warning: 'bg-warning-50 text-warning-600 dark:bg-amber-900/30  dark:text-amber-400',
  info:    'bg-info-50   text-info-600   dark:bg-sky-900/30    dark:text-sky-400',
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  colorScheme = 'primary',
  className   = '',
}: StatCardProps) {
  const trendPositive = trend && trend.value > 0;
  const trendNegative = trend && trend.value < 0;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-medium text-text-muted truncate">{label}</span>
          <span className="text-3xl font-bold text-text-primary truncate">{value}</span>
          {trend && (
            <span className={[
              'inline-flex items-center gap-0.5 text-xs font-medium',
              trendPositive ? 'text-success-600' : trendNegative ? 'text-danger-600' : 'text-text-muted',
            ].join(' ')}>
              {trendPositive && '↑'}
              {trendNegative && '↓'}
              {Math.abs(trend.value)}%{trend.label && ` ${trend.label}`}
            </span>
          )}
        </div>
        {icon && (
          <div className={[
            'shrink-0 flex items-center justify-center',
            'w-12 h-12 rounded-xl',
            colorMap[colorScheme],
          ].join(' ')}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
