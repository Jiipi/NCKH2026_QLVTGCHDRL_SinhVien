import React from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function ActivityApprovalHero({ stats }) {
  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    rejected: stats?.rejected || 0
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(45,212,191,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(20,184,166,0.10),transparent_26%)]" />
      <div className="relative z-10 space-y-6">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
            {safeStats.total} hoạt động
          </div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Phê duyệt hoạt động</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Xem và phê duyệt các hoạt động do sinh viên trong lớp tạo.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Clock} label="Tổng hoạt động" value={safeStats.total} tone="text-cyan-600 dark:text-cyan-300" />
          <StatCard icon={AlertCircle} label="Chờ duyệt" value={safeStats.pending} tone="text-amber-600 dark:text-amber-300" />
          <StatCard icon={CheckCircle} label="Đã duyệt" value={safeStats.approved} tone="text-emerald-600 dark:text-emerald-300" />
          <StatCard icon={XCircle} label="Từ chối" value={safeStats.rejected} tone="text-rose-600 dark:text-rose-300" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{label}</p>
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <p className={`text-3xl font-black tracking-[-0.04em] ${tone}`}>{value}</p>
    </div>
  );
}


