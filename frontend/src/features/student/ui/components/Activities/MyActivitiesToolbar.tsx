import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List
} from 'lucide-react';
import ActivitySortBar from '../../../../activities/ui/shared/ActivitySortBar';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function MyActivitiesToolbar({
  query,
  onSearch,
  showFilters,
  onToggleFilters,
  activeFilterCount = 0,
  onClearFilters,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  tabs = [],
  activeTab,
  onTabChange
}) {
  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-[2rem] border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              className="block w-full rounded-2xl border border-white/70 bg-white/55 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/75 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none"
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
              <span className="min-w-[18px] rounded-full bg-indigo-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center">
            <ActivitySortBar sortBy={sortBy as 'newest' | 'oldest' | 'name-az' | 'name-za'} onSortChange={onSortChange} />
          </div>

          <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/35 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <ViewToggleButton label="Lưới" icon={Grid3X3} active={viewMode === 'grid'} onClick={() => onViewModeChange('grid')} />
            <ViewToggleButton label="Danh sách" icon={List} active={viewMode === 'list'} onClick={() => onViewModeChange('list')} />
          </div>
        </form>
      </div>

      <div className="rounded-[2rem] border border-white/60 bg-white/50 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/20">
        <div className="flex flex-wrap items-stretch divide-x divide-slate-200/70 dark:divide-white/10">
          {tabs.map((config) => (
            <StatusTab
              key={config.key}
              icon={config.icon}
              label={config.title}
              count={config.count}
              active={activeTab === config.key}
              onClick={() => onTabChange(config.key)}
              colorKey={config.key}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const colorMap = {
  pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', active: 'bg-amber-50/70 dark:bg-amber-400/10' },
  approved: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', active: 'bg-emerald-50/70 dark:bg-emerald-400/10' },
  joined: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30', active: 'bg-indigo-50/70 dark:bg-indigo-400/10' },
  rejected: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30', active: 'bg-rose-50/70 dark:bg-rose-400/10' },
};

function StatusTab({ icon: Icon, label, count, active, onClick, colorKey }) {
  const colors = colorMap[colorKey] || colorMap.joined;
  return (
    <button
      onClick={onClick}
      className={`relative flex min-w-[140px] flex-1 cursor-pointer items-center gap-2.5 px-4 py-3 transition-all duration-200 ${
        active ? colors.active : 'hover:bg-white/45 dark:hover:bg-white/5'
      }`}
    >
      {active && <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full ${colors.color.replace('text-', 'bg-').replace(' dark:text-', ' dark:bg-')}`} />}
      <div className={`rounded-xl p-1.5 ${colors.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${colors.color}`} />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold uppercase leading-none tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
        <span className={`text-lg font-black leading-tight ${active ? colors.color : 'text-slate-700 dark:text-slate-300'}`}>{count}</span>
      </div>
    </button>
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
