import React from 'react';
import { Download, FileText, Users, Activity, Award, TrendingUp, BarChart3 } from 'lucide-react';

export default function ReportsHeader({ overview, avgScore, onExportExcel, onExportPDF }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(45,212,191,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(20,184,166,0.10),transparent_26%)]" />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
              <BarChart3 className="h-4 w-4" />
              Báo cáo lớp học
            </div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">Báo cáo thống kê</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Phân tích chi tiết hoạt động và thành tích rèn luyện của lớp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onExportExcel} className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
              <Download className="h-4 w-4" />
              Excel
            </button>
            <button onClick={onExportPDF} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950">
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <GlassMetric icon={Users} label="Sinh viên" value={overview?.totalStudents || 0} tone="text-cyan-600 dark:text-cyan-300" />
          <GlassMetric icon={Activity} label="Hoạt động" value={overview?.totalActivities || 0} tone="text-emerald-600 dark:text-emerald-300" />
          <GlassMetric icon={Award} label="Điểm TB" value={avgScore} tone="text-amber-600 dark:text-amber-300" />
          <GlassMetric icon={TrendingUp} label="Tham gia" value={`${overview?.participationRate || 0}%`} tone="text-rose-600 dark:text-rose-300" />
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
