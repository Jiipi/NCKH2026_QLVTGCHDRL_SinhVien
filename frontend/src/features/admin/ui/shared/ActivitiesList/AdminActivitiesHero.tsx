import React from 'react';
import { Activity, AlertCircle, CheckCircle, XCircle, LucideIcon } from 'lucide-react';

interface AdminActivitiesHeroProps {
  totalActivities?: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
}

interface EditorialMetricProps {
  icon: LucideIcon;
  value: number;
  label: string;
  tone: string;
}

export default function AdminActivitiesHero({
  totalActivities = 0,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0
}: AdminActivitiesHeroProps): React.ReactElement {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.12),transparent_28%)]" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.8)]" />
            Điều phối hoạt động
          </div>

          <h1 className="max-w-3xl text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
            Quản lý hoạt động
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
            Theo dõi, lọc, duyệt và quản lý hoạt động rèn luyện theo học kỳ trong không gian quản trị tập trung.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/60 bg-white/40 p-3 shadow-inner shadow-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <GlassMetric icon={Activity} value={totalActivities} label="Tổng hoạt động" tone="text-slate-950 dark:text-white" />
          <GlassMetric icon={AlertCircle} value={pendingCount} label="Chờ duyệt" tone="text-amber-600 dark:text-amber-300" />
          <GlassMetric icon={CheckCircle} value={approvedCount} label="Đã duyệt" tone="text-emerald-600 dark:text-emerald-300" />
          <GlassMetric icon={XCircle} value={rejectedCount} label="Từ chối" tone="text-rose-600 dark:text-rose-300" />
        </div>
      </div>
    </section>
  );
}

function GlassMetric({ icon: Icon, value, label, tone }: EditorialMetricProps): React.ReactElement {
  return (
    <div className="rounded-2xl border border-white/65 bg-white/55 p-4 shadow-sm backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/45">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
        <span className="rounded-full border border-white/70 bg-white/55 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Icon className={`h-4 w-4 ${tone}`} />
        </span>
      </div>
      <p className={`text-3xl font-black tracking-[-0.05em] leading-none ${tone}`}>{value}</p>
    </div>
  );
}
