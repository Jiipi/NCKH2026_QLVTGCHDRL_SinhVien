import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

export default function MyActivitiesFiltersPanel({
  visible,
  filters,
  activityTypes = [],
  onFilterChange,
  onClearAll,
  activeFilterCount = 0
}) {
  if (!visible) return null;

  const safeTypes = Array.isArray(activityTypes) ? activityTypes : [];

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">Bộ lọc nâng cao</h3>
        {activeFilterCount > 0 && (
          <span className="text-sm text-gray-600">
            Đang áp dụng <span className="font-bold text-blue-600">{activeFilterCount}</span> bộ lọc
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label iconColor="text-blue-600" text="Loại hoạt động" />
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
          >
            <option value="">Tất cả loại</option>
            {safeTypes.map((type) => {
              const typeName = typeof type === 'string' ? type : type?.name || type?.ten_loai_hd || '';
              const typeValue = typeof type === 'string' ? type : type?.name || type?.ten_loai_hd || type?.id || '';
              const typeKey = typeof type === 'string' ? type : type?.id || type?.name || type?.ten_loai_hd || '';
              return (
                <option key={typeKey} value={typeValue}>
                  {typeName}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <Label iconColor="text-green-600" text="Từ ngày" />
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onFilterChange('from', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
          />
        </div>
        <div>
          <Label iconColor="text-red-600" text="Đến ngày" />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onFilterChange('to', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {activeFilterCount > 0 ? (
            <span>
              ✓ Đã áp dụng <strong>{activeFilterCount}</strong> bộ lọc
            </span>
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

function Label({ iconColor, text }) {
  return (
    <label className={`inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2`}>
      <Calendar className={`h-4 w-4 ${iconColor}`} />
      {text}
    </label>
  );
}

