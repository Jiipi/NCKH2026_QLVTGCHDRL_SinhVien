import React from 'react';
import { Search, Calendar, Grid3X3, List, SlidersHorizontal, X, Filter } from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

export default function TeacherActivitiesControls({
  searchTerm,
  onSearchChange,
  semester,
  onSemesterChange,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  activityTypes
}) {
  const activeFilterCount = [
    filters.type,
    filters.location,
    filters.from,
    filters.to,
    filters.minPoints,
    filters.maxPoints
  ].filter(Boolean).length;

  const handleFilterChange = (field, value) => {
    onFiltersChange?.({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFiltersChange?.({
      type: '',
      location: '',
      from: '',
      to: '',
      minPoints: '',
      maxPoints: ''
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mb-6" data-ref="teacher-activities-controls">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <SemesterFilter value={semester} onChange={onSemesterChange} label="" />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => onViewModeChange?.('grid')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Lưới
              </button>
              <button
                onClick={() => onViewModeChange?.('list')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
                Danh sách
              </button>
            </div>

            <button
              onClick={onToggleFilters}
              className="flex items-center gap-2 px-4 py-2 border-2 border-purple-200 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc {activeFilterCount > 0 && <span className="text-xs">({activeFilterCount})</span>}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {[
              { label: 'Tất cả', value: 'all' },
              { label: 'Chờ duyệt', value: 'cho_duyet' },
              { label: 'Đã duyệt', value: 'da_duyet' },
              { label: 'Từ chối', value: 'tu_choi' }
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => onStatusFilterChange?.(status.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  statusFilter === status.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-az">Tên A-Z</option>
              <option value="name-za">Tên Z-A</option>
              <option value="points-high">Điểm cao</option>
              <option value="points-low">Điểm thấp</option>
            </select>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-5 border-t border-dashed border-gray-200 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
              Bộ lọc nâng cao
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Xóa bộ lọc
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Loại hoạt động</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tất cả</option>
                {(activityTypes || []).map((type) => (
                  <option key={type.id || type.value} value={type.id || type.value}>
                    {type.ten_loai_hd || type.label || type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Địa điểm</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Ví dụ: Hội trường A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Điểm tối thiểu</label>
              <input
                type="number"
                value={filters.minPoints}
                onChange={(e) => handleFilterChange('minPoints', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Điểm tối đa</label>
              <input
                type="number"
                value={filters.maxPoints}
                onChange={(e) => handleFilterChange('maxPoints', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


