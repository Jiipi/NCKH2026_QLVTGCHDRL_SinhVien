import React from 'react';
import { Award, Medal, Star, Trophy } from 'lucide-react';

export default function TopStudentsList({ students }) {
  if (!students?.length) return null;

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Top sinh viên xuất sắc</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Xếp hạng theo điểm rèn luyện và số hoạt động tham gia.</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-3 py-2 text-xs font-bold text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <Award className="h-4 w-4 text-amber-500" />
          {students.length} sinh viên
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
        <div className="hidden grid-cols-[72px_minmax(0,1fr)_130px_120px] border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:border-white/10 dark:bg-white/5 md:grid">
          <span>Hạng</span>
          <span>Sinh viên</span>
          <span className="text-right">Điểm RL</span>
          <span className="text-right">Hoạt động</span>
        </div>

        {students.slice(0, 5).map((student, index) => (
          <StudentRow key={student.mssv || index} student={student} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

function StudentRow({ student, rank }) {
  const rankTone = rank === 1
    ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20'
    : rank === 2
      ? 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10'
      : rank === 3
        ? 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20'
        : 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20';

  return (
    <div className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 dark:border-white/10 md:grid-cols-[72px_minmax(0,1fr)_130px_120px] md:items-center">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ring-1 ${rankTone}`}>
        {rank <= 3 ? <Medal className="h-5 w-5" /> : `#${rank}`}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{student.name || 'Sinh viên'}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">MSSV: {student.mssv || '-'}</p>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 md:hidden">Điểm RL</span>
        <span className="inline-flex items-center gap-1.5 text-2xl font-black text-slate-950 dark:text-white">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {student.points || 0}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 md:hidden">Hoạt động</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {student.activities || 0} hoạt động
        </span>
      </div>
    </div>
  );
}
