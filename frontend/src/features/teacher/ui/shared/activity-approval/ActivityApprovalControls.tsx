import React from 'react';
import { Search, Grid3X3, List, Filter } from 'lucide-react';

export default function ActivityApprovalControls({
  searchTerm,
  onSearchChange,
  semester,
  onSemesterChange,
  displayViewMode,
  onDisplayViewModeChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/70 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-6 mb-6">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm hoạt động..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="block w-full pl-12 pr-4 py-3 text-sm border border-white/60 dark:border-white/10 rounded-xl bg-white/70 dark:bg-slate-950/50 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortBy || 'newest'}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="px-3 py-2 text-sm border border-white/60 dark:border-white/10 rounded-xl bg-white/70 dark:bg-slate-950/50 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-az">Tên A → Z</option>
              <option value="name-za">Tên Z → A</option>
            </select>
          </div>

          <div className="w-px h-8 bg-white/50 dark:bg-white/10"></div>

          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">Hiển thị:</span>
          <div className="flex items-center gap-1 bg-white/50 dark:bg-white/10 rounded-xl p-1 border border-white/60 dark:border-white/10 backdrop-blur-sm">
            <button
              onClick={() => onDisplayViewModeChange?.('grid')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                displayViewMode === 'grid'
                  ? 'bg-white/90 dark:bg-white/15 shadow-md text-blue-600 dark:text-blue-300 border border-blue-200/70 dark:border-blue-300/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Hiển thị dạng lưới"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Lưới</span>
            </button>
            <button
              onClick={() => onDisplayViewModeChange?.('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                displayViewMode === 'list'
                  ? 'bg-white/90 dark:bg-white/15 shadow-md text-blue-600 dark:text-blue-300 border border-blue-200/70 dark:border-blue-300/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Hiển thị dạng danh sách"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


