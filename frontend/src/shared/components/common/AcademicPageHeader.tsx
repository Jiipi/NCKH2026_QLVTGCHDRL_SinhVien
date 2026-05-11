import React from 'react';

/**
 * AcademicPageHeader — Compact, clean page header replacing neo-brutalist 280px headers.
 * Height ~80px, with icon + title + subtitle + optional right-side stats.
 */

export interface AcademicPageHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconBgColor?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  stats?: Array<{ label: string; value: string | number; color?: string }>;
}

export default function AcademicPageHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor = 'text-white',
  iconBgColor = 'bg-blue-800 dark:bg-blue-700',
  badge,
  actions,
  stats,
}: AcademicPageHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center shadow-sm`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Stats badges or actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {stats?.map((stat, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
              <span className={`text-sm font-bold ${stat.color || 'text-slate-900 dark:text-slate-100'}`}>{stat.value}</span>
            </div>
          ))}
          {actions}
        </div>
      </div>
    </div>
  );
}
