import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Clock, Calendar, MapPin, RefreshCw, X } from 'lucide-react';

export default function ActivitiesListFiltersPanel({
  visible,
  filters,
  activityTypes = [],
  statusOptions = [],
  onFilterChange,
  onClearAll,
  activeFilterCount = 0
}) {
  const safeTypes = Array.isArray(activityTypes) ? activityTypes : [];
  const safeStatus = Array.isArray(statusOptions) ? statusOptions : [];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bộ lọc nâng cao</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                    {activeFilterCount} đang áp dụng
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Filters Grid — compact inline */}
            <div className="flex items-end gap-3 flex-wrap">
              {/* Loại hoạt động */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Loại</label>
                <select
                  value={filters.type}
                  onChange={(e) => onFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                >
                  <option value="">Tất cả loại</option>
                  {safeTypes.map((type) => (
                    <option key={type.id || type.ten_loai_hd} value={String(type.id || '')}>
                      {type.ten_loai_hd || type.name || 'Chưa có tên'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trạng thái */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                >
                  {safeStatus.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Từ ngày */}
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => onFilterChange('from', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                />
              </div>

              {/* Đến ngày */}
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => onFilterChange('to', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
