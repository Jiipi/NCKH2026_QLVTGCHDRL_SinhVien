import React from 'react';
import type { ProfileTheme } from '../profileTheme';

export interface ProfileStatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
}

interface ProfileStatsCardProps {
  stats: ProfileStatItem[];
  theme: ProfileTheme;
  title?: string;
  description?: string;
}

export default function ProfileStatsCard({ stats, theme, title, description }: ProfileStatsCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      {(title || description) && (
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          {title && <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>}
          {description && <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      )}
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:border-gray-600 ${
              stat.colorClass || theme.statCards[index % theme.statCards.length]
            }`}
          >
            {/* Background icon */}
            <div className={`absolute -bottom-2 -right-2 opacity-10 transition-transform duration-300 group-hover:scale-110`}>
              {React.cloneElement(stat.icon as React.ReactElement<{ className?: string }>, {
                className: `h-20 w-20 ${stat.colorClass ? 'text-white' : 'text-slate-400'}`
              })}
            </div>

            <div className="relative z-10">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg backdrop-blur-sm ${
                stat.colorClass || theme.statCards[index % theme.statCards.length]
              }`}>
                <div className="text-white opacity-90">{stat.icon}</div>
              </div>
              <div className="mt-3">
                <div className={`text-3xl font-black tracking-tight ${stat.colorClass ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {stat.value}
                </div>
                <div className={`mt-1 text-xs font-bold uppercase tracking-wider ${stat.colorClass ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {stat.label}
                </div>
                {stat.trend && (
                  <div className={`mt-1 text-xs font-medium ${stat.colorClass ? 'text-white/70' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {stat.trend}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
