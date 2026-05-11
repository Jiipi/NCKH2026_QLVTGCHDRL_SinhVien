import React from 'react';

/**
 * AcademicStatCard — Clean stat display card for all roles.
 * Uses subtle icon coloring + large number on white/dark surface.
 */

export interface AcademicStatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;        // e.g. 'text-blue-600'
  iconBgColor?: string;      // e.g. 'bg-blue-50'
  trend?: 'up' | 'down' | null;
  trendValue?: string;
}

export default function AcademicStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor = 'text-blue-600 dark:text-blue-400',
  iconBgColor = 'bg-blue-50 dark:bg-blue-900/30',
  trend,
  trendValue,
}: AcademicStatCardProps) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-slate-950/50 dark:hover:bg-white/10">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBgColor}`}>
          <Icon className={`h-5.5 w-5.5 ${iconColor}`} />
        </div>
        {trend && trendValue && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend === 'up' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <p className="mb-0.5 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
