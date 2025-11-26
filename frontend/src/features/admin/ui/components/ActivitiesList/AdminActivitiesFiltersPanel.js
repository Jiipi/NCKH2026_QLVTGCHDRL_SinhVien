import React from 'react';
import { Calendar, Filter, Clock, RefreshCw, Tag } from 'lucide-react';

export default function AdminActivitiesFiltersPanel({
  visible,
  filters,
  activityTypes = [],
  statusOptions = [],
  onFilterChange,
  onClearAll,
  activeFilterCount = 0
}) {
  if (!visible) {
    return null;
  }

  const safeTypes = Array.isArray(activityTypes) ? activityTypes : [];
  const safeStatus = Array.isArray(statusOptions) ? statusOptions : [];

  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5 text-indigo-600" />
          Bộ lọc nâng cao
        </h3>
        {activeFilterCount > 0 && (
          <span className="text-sm text-gray-600">
            Đang áp dụng <span className="font-bold text-indigo-600">{activeFilterCount}</span> bộ lọc
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterField
          label="Loại hoạt động"
          icon={Tag}
          iconColor="text-indigo-600"
          element={
            <select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 hover:border-indigo-300"
            >
              <option value="">Tất cả loại</option>
              {safeTypes.map((type) => (
                <option key={type.id || type.ten_loai_hd || type.name} value={String(type.id || '')}>
                  {type.ten_loai_hd || type.name || 'Chưa có tên'}
                </option>
              ))}
            </select>
          }
        />

        <FilterField
          label="Trạng thái"
          icon={Clock}
          iconColor="text-green-600"
          element={
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 hover:border-indigo-300"
            >
              {safeStatus.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />

        <FilterField
          label="Từ ngày"
          icon={Calendar}
          iconColor="text-purple-600"
          element={
            <input
              type="date"
              value={filters.from}
              onChange={(e) => onFilterChange('from', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 hover:border-indigo-300"
            />
          }
        />

        <FilterField
          label="Đến ngày"
          icon={Calendar}
          iconColor="text-orange-600"
          element={
            <input
              type="date"
              value={filters.to}
              onChange={(e) => onFilterChange('to', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200 hover:border-indigo-300"
            />
          }
        />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {activeFilterCount > 0 ? (
            <span>✓ Đã áp dụng <strong>{activeFilterCount}</strong> bộ lọc</span>
          ) : (
            <span>Chưa có bộ lọc nào được áp dụng</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Xóa tất cả
          </button>
        )}
      </div>
    </div>
  );
}

function FilterField({ label, icon: Icon = Calendar, iconColor, element }) {
  return (
    <div>
      <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {label}
      </label>
      {element}
    </div>
  );
}
