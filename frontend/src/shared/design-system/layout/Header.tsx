/**
 * Design System — Header Component
 *
 * @module design-system/layout
 */

import React, { type ReactNode } from 'react';

/* ============================================================
   Page Header (dùng trong trang)
   ============================================================ */

interface PageHeaderProps {
  title:       string;
  subtitle?:   string;
  breadcrumb?:  Array<{ label: string; href?: string }>;
  actions?:     ReactNode;
  avatar?:     ReactNode;
  badge?:      ReactNode;
  className?:  string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  avatar,
  badge,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4 mb-6', className].join(' ')}>
      <div className="flex items-center gap-4 min-w-0">
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1 text-xs text-text-muted mb-1">
              {breadcrumb.map((crumb, i) => (
                <React.Fragment key={crumb.label}>
                  {i > 0 && <span>/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-primary-600 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-bold text-text-primary dark:text-white truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {badge && <div className="shrink-0 mt-1">{badge}</div>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

/* ============================================================
   Global Header (top bar)
   ============================================================ */

interface GlobalHeaderProps {
  logo?:     ReactNode;
  title?:   string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function GlobalHeader({
  logo,
  title,
  children,
  actions,
  className = '',
}: GlobalHeaderProps) {
  return (
    <header
      className={[
        'flex items-center h-16 px-6',
        'bg-white dark:bg-slate-900',
        'border-b border-slate-200 dark:border-slate-700',
        'shrink-0',
        className,
      ].join(' ')}
    >
      {logo && <div className="shrink-0 mr-4">{logo}</div>}
      {title && (
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      )}
      <div className="flex-1">{children}</div>
      {actions && (
        <div className="flex items-center gap-2 ml-4">{actions}</div>
      )}
    </header>
  );
}

/* ============================================================
   Tabs
   ============================================================ */

interface Tab {
  id:     string;
  label: string;
  icon?:  ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs:       Tab[];
  activeTab:  string;
  onChange:  (id: string) => void;
  size?:     'sm' | 'md';
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, size = 'md', className = '' }: TabsProps) {
  const tabHeight = size === 'sm' ? 'h-8 text-sm' : 'h-10 text-sm';
  const indicator = tabs.find(t => t.id === activeTab);

  return (
    <div className={['relative', className].join(' ')}>
      <div className="flex items-center gap-1 p-1 bg-surface-muted dark:bg-slate-800 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={[
              'relative z-10 flex items-center gap-1.5 px-3 font-medium rounded-lg',
              'transition-all duration-200',
              tabHeight,
              tab.id === activeTab
                ? 'bg-white dark:bg-slate-700 text-text-primary dark:text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:text-slate-400 dark:hover:text-slate-200',
              tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={[
                'text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center',
                tab.id === activeTab
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
              ].join(' ')}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Filter Bar
   ============================================================ */

interface FilterBarProps {
  children:   ReactNode;
  className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={[
      'flex flex-wrap items-center gap-3 p-4',
      'bg-surface-card rounded-xl border border-border-default',
      'dark:bg-slate-800 dark:border-slate-700',
      className,
    ].join(' ')}>
      {children}
    </div>
  );
}

/* ============================================================
   Section Header
   ============================================================ */

interface SectionHeaderProps {
  title:     string;
  subtitle?: string;
  action?:   ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={['flex items-center justify-between gap-4 mb-4', className].join(' ')}>
      <div>
        <h2 className="text-base font-semibold text-text-primary dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
