import React from 'react';

export interface HeroChip {
  icon: React.ElementType;
  label: string;
}

export interface HeroMetric {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone?: string;
}

export interface RolePageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  chips?: HeroChip[];
  metrics?: HeroMetric[];
  badge?: {
    icon: React.ElementType;
    label: string;
  };
  heroIcon?: React.ElementType;
  actions?: React.ReactNode;
  className?: string;
}

function GlassMetric({ icon: Icon, label, value, tone = 'text-indigo-600 dark:text-indigo-300' }: HeroMetric) {
  return (
    <div className="min-h-[88px] rounded-2xl border border-white/70 bg-white/58 p-3.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="min-w-0 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{label}</span>
        <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
      </div>
      <p className={`text-2xl font-black sm:text-3xl ${tone}`}>{value}</p>
    </div>
  );
}

function getMetricGridClass(count: number) {
  if (count <= 1) return 'grid-cols-1 sm:w-[180px]';
  if (count === 2) return 'grid-cols-2 sm:w-[300px]';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3 lg:w-[430px]';
  if (count === 4) return 'grid-cols-2 lg:w-[360px]';
  return 'grid-cols-2 sm:grid-cols-3 lg:w-[520px]';
}

export default function RolePageHero({
  eyebrow,
  title,
  description,
  chips,
  metrics,
  badge,
  heroIcon: HeroIcon,
  actions,
  className = '',
}: RolePageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.14),transparent_28%)]" />

      <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className={`${HeroIcon ? 'flex items-start gap-3 sm:gap-4' : ''} min-w-0`}>
          {HeroIcon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-500/20 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950 sm:h-14 sm:w-14 sm:rounded-[1.4rem]">
              <HeroIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          )}
          <div className="min-w-0">
            {badge && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
                <badge.icon className="h-4 w-4" />
                {badge.label}
              </div>
            )}

            {!badge && (
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
                {eyebrow}
              </p>
            )}

            <h1 className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
              {description}
            </p>
          </div>
        </div>

        {(Boolean(chips?.length) || Boolean(metrics?.length) || actions) && (
          <div className="w-full rounded-[1.5rem] border border-white/45 bg-white/24 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:w-auto lg:max-w-[560px]">
            {chips && chips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chips.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-indigo-300" />
                    {label}
                  </span>
                ))}
              </div>
            )}

            {metrics && metrics.length > 0 && (
              <div className={`grid gap-2.5 ${getMetricGridClass(metrics.length)}`}>
                {metrics.map((metric) => (
                  <GlassMetric key={metric.label} {...metric} />
                ))}
              </div>
            )}

            {actions && (
              <div className={`${metrics?.length || chips?.length ? 'mt-3 border-t border-white/50 pt-3 dark:border-white/10' : ''} flex flex-wrap items-center justify-start gap-2`}>
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
