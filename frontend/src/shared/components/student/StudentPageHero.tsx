import React from 'react';

/* ─── Types ─── */

export interface HeroChip {
  icon: React.ElementType;
  label: string;
}

export interface HeroMetric {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone?: string; // e.g. "text-indigo-600 dark:text-indigo-300"
}

export interface StudentPageHeroProps {
  /** Eyebrow text — e.g. "Không gian sinh viên" */
  eyebrow: string;
  /** Page title */
  title: string;
  /** Short description */
  description: string;
  /** Small stat chips displayed inline (default mode) */
  chips?: HeroChip[];
  /** Larger metric cards (alternative mode — used by Certificates) */
  metrics?: HeroMetric[];
  /** Optional badge pill shown above the title */
  badge?: {
    icon: React.ElementType;
    label: string;
  };
  /** Optional large icon shown to the left of text (used by QR Scanner) */
  heroIcon?: React.ElementType;
  /** Additional className */
  className?: string;
}

/* ─── Sub-components ─── */

function GlassMetric({ icon: Icon, label, value, tone = 'text-indigo-600 dark:text-indigo-300' }: HeroMetric) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{label}</span>
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <p className={`text-3xl font-black tracking-[-0.04em] ${tone}`}>{value}</p>
    </div>
  );
}

/* ─── Main Component ─── */

/**
 * StudentPageHero — Unified hero/header card for all student pages.
 *
 * Supports two stat display modes:
 * - **chips** (default): small inline tags
 * - **metrics**: larger card-style metrics (e.g. Certificates page)
 */
export default function StudentPageHero({
  eyebrow,
  title,
  description,
  chips,
  metrics,
  badge,
  heroIcon: HeroIcon,
  className = '',
}: StudentPageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6 ${className}`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.14),transparent_28%)]" />

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: text content */}
        <div className={HeroIcon ? 'flex items-start gap-3 sm:gap-4' : undefined}>
          {/* Optional hero icon */}
          {HeroIcon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-500/20 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950 sm:h-14 sm:w-14 sm:rounded-[1.4rem]">
              <HeroIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          )}
          <div>
            {/* Optional badge */}
            {badge && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
                <badge.icon className="h-4 w-4" />
                {badge.label}
              </div>
            )}

            {/* Eyebrow — only render if no badge (they serve similar roles) */}
            {!badge && (
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">
                {eyebrow}
              </p>
            )}

            <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
              {description}
            </p>
          </div>
        </div>

        {/* Right: chips OR metrics */}
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/45 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <Icon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
                {label}
              </span>
            ))}
          </div>
        )}

        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            {metrics.map((metric) => (
              <GlassMetric key={metric.label} {...metric} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
