import React from 'react';
import { BarChart3, TrendingUp, FileText, Sparkles } from 'lucide-react';

interface AdminReportsStats {
  total?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
}

interface AdminReportsHeaderProps {
  stats?: AdminReportsStats;
}

export default function AdminReportsHeader({ stats = {} }: AdminReportsHeaderProps) {
  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.12),transparent_28%)]" />
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            Thống kê tổng quan
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Báo cáo hệ thống</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Thống kê tổng quan hoạt động và đăng ký trong hệ thống.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/60 bg-white/40 p-3 shadow-inner shadow-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <GlassStat icon={BarChart3} label="Tổng số" value={safeStats.total} tone="text-slate-950 dark:text-white" />
          <GlassStat icon={Sparkles} label="Chờ duyệt" value={safeStats.pending} tone="text-amber-600 dark:text-amber-300" />
          <GlassStat icon={TrendingUp} label="Đã duyệt" value={safeStats.approved} tone="text-emerald-600 dark:text-emerald-300" />
          <GlassStat icon={FileText} label="Từ chối" value={safeStats.rejected} tone="text-rose-600 dark:text-rose-300" />
        </div>
      </div>
    </section>
  );
}

function GlassStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/65 bg-white/55 p-4 shadow-sm backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/45">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
        <span className="rounded-full border border-white/70 bg-white/55 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Icon className={`h-4 w-4 ${tone}`} />
        </span>
      </div>
      <p className={`text-3xl font-black leading-none tracking-[-0.05em] ${tone}`}>{value}</p>
    </div>
  );
}

