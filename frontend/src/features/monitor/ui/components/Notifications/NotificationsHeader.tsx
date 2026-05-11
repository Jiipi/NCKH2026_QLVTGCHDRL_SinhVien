import React from 'react';
import { Clock, MessageSquare, Users, Activity, Bell } from 'lucide-react';

export default function NotificationsHeader({ stats, showHistory, onToggleHistory }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(45,212,191,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(20,184,166,0.10),transparent_26%)]" />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
              <Bell className="h-4 w-4" />
              {stats.total} đã gửi
            </div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">Gửi thông báo</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Gửi thông báo và cập nhật quan trọng đến sinh viên trong lớp.
            </p>
          </div>
          <button onClick={onToggleHistory} className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
            <Clock className="h-4 w-4" />
            {showHistory ? 'Ẩn lịch sử' : 'Lịch sử'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <GlassMetric icon={MessageSquare} label="Tổng" value={stats.total} tone="text-cyan-600 dark:text-cyan-300" />
          <GlassMetric icon={Users} label="Toàn lớp" value={stats.classScope} tone="text-amber-600 dark:text-amber-300" />
          <GlassMetric icon={Activity} label="Hoạt động" value={stats.activityScope} tone="text-rose-600 dark:text-rose-300" />
        </div>
      </div>
    </div>
  );
}

function GlassMetric({ icon: Icon, label, value, tone }) {
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
