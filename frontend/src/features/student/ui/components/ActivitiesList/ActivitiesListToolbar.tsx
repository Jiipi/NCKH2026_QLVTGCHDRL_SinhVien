import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  TrendingUp,
  Clock,
  CheckCircle,
  Award
} from 'lucide-react';
import ActivitySortBar from '../../../../activities/ui/shared/ActivitySortBar';

interface ToolbarProps {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: (e: any) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
  viewMode: string;
  onViewModeChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
  stats?: { total: number; upcoming: number; past: number; totalPoints: number };
}

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function ActivitiesListToolbar({
  query,
  onQueryChange,
  onSearch,
  showFilters,
  onToggleFilters,
  onClearFilters,
  activeFilterCount = 0,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  stats = { total: 0, upcoming: 0, past: 0, totalPoints: 0 }
}: ToolbarProps) {
  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Row 1: Search + Filters inline */}
      <div className="rounded-[2rem] border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <form onSubmit={onSearch} className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="block w-full rounded-2xl border border-white/70 bg-white/55 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/75 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:focus:ring-indigo-500/10"
              placeholder="Tìm kiếm hoạt động..."
            />
          </div>

          <button
            onClick={onToggleFilters}
            type="button"
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold shadow-sm backdrop-blur-xl transition-all ${
              showFilters || activeFilterCount > 0
                ? 'border-indigo-200/70 bg-indigo-50/70 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'border-white/60 bg-white/40 text-slate-600 hover:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Lọc nâng cao</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full min-w-[18px] text-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center">
            <ActivitySortBar sortBy={sortBy as 'newest' | 'oldest' | 'name-az' | 'name-za'} onSortChange={onSortChange} />
          </div>

          <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/35 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <ViewToggleButton
              label="Lưới"
              icon={Grid3X3}
              active={viewMode === 'grid'}
              onClick={() => onViewModeChange('grid')}
            />
            <ViewToggleButton
              label="Danh sách"
              icon={List}
              active={viewMode === 'list'}
              onClick={() => onViewModeChange('list')}
            />
          </div>
        </form>
      </div>

      {/* Row 2: Stats summary */}
      <div className="rounded-[2rem] border border-white/60 bg-white/50 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/20">
        <div className="flex items-center gap-0 divide-x divide-slate-200 dark:divide-slate-700 flex-wrap">

          {/* Stat: Tổng */}
          <StatCell icon={TrendingUp} label="Tổng" value={stats.total} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-900/30" />

          {/* Stat: Sắp tới */}
          <StatCell icon={Clock} label="Sắp" value={stats.upcoming} color="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-900/30" />

          {/* Stat: Đã tham gia */}
          <StatCell icon={CheckCircle} label="Đã" value={stats.past} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-900/30" />

          {/* Stat: Điểm */}
          <StatCell icon={Award} label="Điểm" value={stats.totalPoints} color="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-900/30" suffix="/100" />
        </div>
      </div>
    </motion.div>
  );
}

function StatCell({ icon: Icon, label, value, color, bgColor, suffix = '' }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 flex-1 min-w-[100px]">
      <div className={`p-1.5 rounded-md ${bgColor}`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400 dark:text-slate-500 leading-none">{label}</span>
        <span className={`text-lg font-bold leading-tight ${color}`}>{value}{suffix && <span className="text-xs font-medium text-slate-400">{suffix}</span>}</span>
      </div>
    </div>
  );
}

function ViewToggleButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
        active ? 'bg-white/80 text-indigo-700 shadow-sm backdrop-blur-xl dark:bg-white/15 dark:text-indigo-300' : 'text-slate-500 hover:bg-white/45 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
      }`}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
