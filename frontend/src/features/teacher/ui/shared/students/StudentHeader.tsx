import React from 'react';
import { Users, GraduationCap, Sparkles } from 'lucide-react';

export function StudentHeader({ totalStudents = 0, totalClasses = 0 }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.12),transparent_28%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            Quản lý sinh viên
          </div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
            Quản lý sinh viên & lớp
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
            Xem danh sách sinh viên, lớp phụ trách và phân công lớp trưởng trong một không gian thống nhất.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-[22rem]">
          <StatCard icon={GraduationCap} label="Lớp phụ trách" value={totalClasses} tone="text-indigo-600 dark:text-indigo-300" />
          <StatCard icon={Users} label="Sinh viên" value={totalStudents} tone="text-teal-600 dark:text-teal-300" />
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

export default StudentHeader;
