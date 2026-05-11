import React from 'react';
import { Activity, Tag, Plus, Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function TeacherActivitiesHero({ activeTab, onTabChange, stats }) {
  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0,
    types: stats?.types || 0
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6" data-ref="teacher-activities-hero">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.12),transparent_28%)]" />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              Quản lý hoạt động
            </div>
            <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
              Điều phối hoạt động rèn luyện
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
              Theo dõi, phê duyệt và tối ưu các hoạt động của lớp bằng các bộ lọc và báo cáo trực quan.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <TabButton active={activeTab === 'activities'} onClick={() => onTabChange?.('activities')} icon={Activity} label="Hoạt động" />
            <TabButton active={activeTab === 'types'} onClick={() => onTabChange?.('types')} icon={Tag} label={`Loại hoạt động (${safeStats.types})`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Activity} label="Tổng hoạt động" value={safeStats.total} tone="text-cyan-600 dark:text-cyan-300" />
          <StatCard icon={Clock} label="Chờ duyệt" value={safeStats.pending} tone="text-amber-600 dark:text-amber-300" />
          <StatCard icon={CheckCircle} label="Đã duyệt" value={safeStats.approved} tone="text-emerald-600 dark:text-emerald-300" />
          <StatCard icon={XCircle} label="Từ chối" value={safeStats.rejected} tone="text-rose-600 dark:text-rose-300" />
        </div>
      </div>
    </section>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 ${
        active
          ? 'border border-indigo-200/70 bg-indigo-50/80 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200'
          : 'border border-white/70 bg-white/55 text-slate-600 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</span>
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <span className={`text-3xl font-black tracking-[-0.04em] ${tone}`}>{value}</span>
    </div>
  );
}
