import React from 'react';
import { Clock, CheckCircle, Trophy, Award, Sparkles } from 'lucide-react';

export default function MyActivitiesHeader({ totalActivities, myRegistrations, totalPoints }) {
  const pending = myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length;
  const approved = myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length;
  const joined = myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(45,212,191,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(20,184,166,0.10),transparent_26%)]" />
      <div className="relative z-10 space-y-6">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            {totalActivities} hoạt động
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">Hoạt động của tôi</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Theo dõi, quản lý và chinh phục các hoạt động rèn luyện bạn đã đăng ký.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <GlassMetric icon={Clock} label="Chờ duyệt" value={pending} tone="text-amber-600 dark:text-amber-300" />
          <GlassMetric icon={CheckCircle} label="Đã duyệt" value={approved} tone="text-emerald-600 dark:text-emerald-300" />
          <GlassMetric icon={Trophy} label="Hoàn thành" value={joined} tone="text-cyan-600 dark:text-cyan-300" />
          <GlassMetric icon={Award} label="Tổng điểm" value={totalPoints.toFixed(1)} tone="text-indigo-600 dark:text-indigo-300" />
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
