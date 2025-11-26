import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';

export default function RegistrationAdvancedFilters({
  visible,
  filters,
  activityTypes,
  onFilterChange,
  onClear,
  activeCount = 0
}) {
  if (!visible) {
    return null;
  }

  const safeActivityTypes = Array.isArray(activityTypes) ? activityTypes : [];

  const handleChange = (field, value) => {
    onFilterChange?.(field, value);
  };

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5 text-indigo-600" />
          Bộ lọc nâng cao
        </h3>
        {activeCount > 0 && (
          <span className="text-sm text-gray-600">
            ✓ Đang áp dụng <strong>{activeCount}</strong> bộ lọc
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Loại hoạt động
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
          >
            <option value="">Tất cả loại</option>
            {safeActivityTypes.map((type) => {
              const label =
                typeof type === 'string'
                  ? type
                  : type?.name || type?.ten_loai_hd || '';
              const value =
                typeof type === 'string'
                  ? type
                  : type?.id || type?.name || type?.ten_loai_hd || '';
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            MSSV
          </label>
          <input
            type="text"
            value={filters.mssv || ''}
            onChange={(e) => handleChange('mssv', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
            placeholder="Nhập MSSV"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Từ ngày
          </label>
          <input
            type="date"
            value={filters.from || ''}
            onChange={(e) => handleChange('from', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Đến ngày
          </label>
          <input
            type="date"
            value={filters.to || ''}
            onChange={(e) => handleChange('to', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Điểm RL tối thiểu
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={filters.minPoints || ''}
            onChange={(e) => handleChange('minPoints', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Điểm RL tối đa
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={filters.maxPoints || ''}
            onChange={(e) => handleChange('maxPoints', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
            placeholder="Không giới hạn"
          />
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}


