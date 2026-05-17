import { Activity, BookOpen, Sparkles, Tag } from 'lucide-react';

export default function TeacherActivitiesHeroInline({
  stats,
  activityTypesCount
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.12),transparent_28%)]" />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              Danh sách giảng viên
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-50/80 p-3 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-400/10 dark:ring-indigo-400/20">
                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Danh sách hoạt động</h1>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
                  Xem, duyệt và quản lý hoạt động rèn luyện theo học kỳ.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCell icon={Activity} label="Tổng hoạt động" value={stats?.total || 0} tone="text-indigo-600 dark:text-indigo-300" />
          <StatCell icon={Tag} label="Loại hoạt động" value={activityTypesCount || 0} tone="text-purple-600 dark:text-purple-300" />
        </div>
      </div>
    </section>
  );
}

function StatCell({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</span>
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <p className={`text-3xl font-black tracking-[-0.04em] ${tone}`}>{value}</p>
    </div>
  );
}
