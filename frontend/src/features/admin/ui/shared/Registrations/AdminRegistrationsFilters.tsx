import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function AdminRegistrationsFilters({
  searchTerm,
  onSearchChange,
  activityFilter,
  onActivityFilterChange,
  activities,
  classId,
  onClassIdChange,
  classes,
  semester,
  onSemesterChange,
  semesterOptions,
  viewMode,
  onViewModeChange,
  stats
}) {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Tìm sinh viên, hoạt động..." 
            value={searchTerm} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-amber-400/20" 
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <select 
            value={activityFilter} 
            onChange={(e) => onActivityFilterChange(e.target.value)} 
            className="w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-amber-400/20"
          >
            <option value="">Tất cả hoạt động</option>
            {activities.map(activity => (
              <option key={activity.id} value={activity.id}>{activity.ten_hd}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <select 
            value={classId} 
            onChange={(e) => onClassIdChange(e.target.value)} 
            className="w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-amber-400/20"
          >
            <option value="">Tất cả lớp</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.ten_lop || cls.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <select 
            value={semester} 
            onChange={(e) => onSemesterChange(e.target.value)} 
            className="w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-amber-400/20"
          >
            {semesterOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="relative md:col-span-1 md:ml-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value)}
            className="w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-amber-400/20"
          >
            <option value="all">Tất cả ({stats.total || 0})</option>
            <option value="pending">Chờ duyệt ({stats.pending || 0})</option>
            <option value="approved">Đã duyệt ({stats.approved || 0})</option>
            <option value="rejected">Từ chối ({stats.rejected || 0})</option>
            <option value="participated">Đã tham gia ({stats.participated || 0})</option>
          </select>
        </div>
      </div>
    </div>
  );
}

