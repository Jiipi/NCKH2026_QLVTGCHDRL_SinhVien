import React from 'react';
import { Clock, CheckCircle, XCircle, UserCheck, ClipboardList } from 'lucide-react';

export default function RegistrationApprovalsHeroInline({ stats }) {
  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    approved: stats?.approved || 0,
    joined: stats?.joined || 0,
    rejected: stats?.rejected || 0
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.12),transparent_28%)]" />
      <div className="relative z-10 space-y-6">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
            <ClipboardList className="h-4 w-4" />
            Phê duyệt đăng ký
          </div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
            Phê duyệt đăng ký tham gia hoạt động
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
            Quản lý đăng ký, duyệt sinh viên đủ điều kiện và theo dõi trạng thái tham gia.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Clock} label="Chờ duyệt" value={safeStats.pending} tone="text-amber-600 dark:text-amber-300" />
          <StatCard icon={CheckCircle} label="Đã duyệt" value={safeStats.approved} tone="text-emerald-600 dark:text-emerald-300" />
          <StatCard icon={UserCheck} label="Đã tham gia" value={safeStats.joined} tone="text-cyan-600 dark:text-cyan-300" />
          <StatCard icon={XCircle} label="Từ chối" value={safeStats.rejected} tone="text-rose-600 dark:text-rose-300" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <Icon className={`mb-3 h-5 w-5 ${tone}`} />
      <p className={`text-3xl font-black tracking-[-0.04em] ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
    </div>
  );
}
