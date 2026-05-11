import React from 'react';
import { Activity, Tag, Plus, BookOpen, Sparkles } from 'lucide-react';

export default function TeacherActivitiesHeroInline({
  activeTab,
  onTabChange,
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
              Danh mục giảng viên
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-50/80 p-3 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-400/10 dark:ring-indigo-400/20">
                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Danh mục hoạt động</h1>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
                  Xem, duyệt và quản lý hoạt động rèn luyện cùng hệ thống loại hoạt động theo học kỳ.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/45 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <TabButton active={activeTab === 'activities'} onClick={() => onTabChange('activities')} icon={Activity} label="Hoạt động" />
              <TabButton active={activeTab === 'types'} onClick={() => onTabChange('types')} icon={Tag} label="Loại hoạt động" />
            </div>

            {activeTab === 'types' && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openActivityTypeModal'))}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Thêm mới
              </button>
            )}
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

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
        active
          ? 'bg-white/80 text-indigo-700 shadow-sm backdrop-blur-xl dark:bg-white/15 dark:text-indigo-300'
          : 'text-slate-500 hover:bg-white/45 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
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
