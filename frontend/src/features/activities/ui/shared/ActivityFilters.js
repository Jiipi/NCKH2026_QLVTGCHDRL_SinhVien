import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, Filter, Calendar, Clock, RefreshCw
} from 'lucide-react';
import SemesterFilter from '../../../shared/components/common/SemesterFilter';

const ACTIVITY_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'open', label: '🟢 Đang mở đăng ký' },
  { value: 'soon', label: '🔵 Đang diễn ra' },
  { value: 'closed', label: '⚫ Đã kết thúc' }
];

export function ActivityFilters({ 
    query, onQueryChange, 
    filters, onFiltersChange,
    semester, onSemesterChange,
    activityTypes,
    onSearch
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = (filters.type ? 1 : 0) + (filters.status ? 1 : 0) + (filters.from ? 1 : 0) + (filters.to ? 1 : 0);

  const clearAllFilters = () => {
    onQueryChange('');
    onFiltersChange({ type: '', status: '', from: '', to: '' });
  };

  return (
    <div className="relative bg-white rounded-3xl border-2 border-gray-100 shadow-xl p-6">
      <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="Tìm kiếm hoạt động..."
          />
        </div>
      </form>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Học kỳ:</span>
            <SemesterFilter value={semester} onChange={onSemesterChange} />
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium border-2 border-gray-200 transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm">Lọc nâng cao</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium border-2 border-red-200 transition-all">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-blue-600" />
            Bộ lọc nâng cao
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Loại hoạt động</label>
              <select
                value={filters.type}
                onChange={e => onFiltersChange({...filters, type: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
              >
                <option value="">Tất cả</option>
                {activityTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Trạng thái</label>
              <select
                value={filters.status}
                onChange={e => onFiltersChange({...filters, status: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
              >
                {ACTIVITY_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Từ ngày</label>
              <input
                type="date"
                value={filters.from}
                onChange={e => onFiltersChange({...filters, from: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Đến ngày</label>
              <input
                type="date"
                value={filters.to}
                onChange={e => onFiltersChange({...filters, to: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
