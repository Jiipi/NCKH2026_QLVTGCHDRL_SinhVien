import React from 'react';
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Grid3X3,
  List,
  ArrowUpDown
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'name-az', label: 'Tên A → Z' },
  { value: 'name-za', label: 'Tên Z → A' },
  { value: 'points-high', label: 'Điểm cao → thấp' },
  { value: 'points-low', label: 'Điểm thấp → cao' }
];

export default function RegistrationToolbar({
  searchTerm,
  onSearchChange,
  semester,
  onSemesterChange,
  semesterOptions,
  showFilters,
  onToggleFilters,
  activeFilterCount = 0,
  onClearFilters,
  displayViewMode,
  onDisplayViewModeChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-950/50/80 dark:bg-slate-900/70 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-6 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm sinh viên, MSSV hoặc tên hoạt động..."
            className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-white/60 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              showFilters
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white/80 dark:bg-slate-950/50/50 dark:bg-white/80 dark:bg-slate-950/50/10 text-slate-700 dark:text-slate-200 border-white/60 dark:border-white/10 hover:border-indigo-300/60'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc nâng cao
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-black/10 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
            <span
              className={`text-[10px] transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl text-sm font-semibold transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <ArrowUpDown className="h-4 w-4" />
          <span>Sắp xếp theo</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-white/60 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-slate-950/50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-white/10 rounded-xl p-1 border-2 border-white/60 dark:border-white/10">
          <button
            onClick={() => onDisplayViewModeChange?.('grid')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              displayViewMode === 'grid'
                ? 'bg-white/80 dark:bg-slate-950/50 shadow text-indigo-600 border border-indigo-200'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            Lưới
          </button>
          <button
            onClick={() => onDisplayViewModeChange?.('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              displayViewMode === 'list'
                ? 'bg-white/80 dark:bg-slate-950/50 shadow text-indigo-600 border border-indigo-200'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
            }`}
          >
            <List className="h-4 w-4" />
            Danh sách
          </button>
        </div>
      </div>
    </div>
  );
}


