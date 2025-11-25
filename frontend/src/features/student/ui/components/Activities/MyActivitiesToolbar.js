import React from 'react';
import {
  Search,
  Calendar,
  SlidersHorizontal,
  RefreshCw,
  Grid3X3,
  List
} from 'lucide-react';

export default function MyActivitiesToolbar({
  query,
  onSearch,
  semester,
  semesterOptions = [],
  onSemesterChange,
  showFilters,
  onToggleFilters,
  activeFilterCount = 0,
  onClearFilters,
  viewMode,
  onViewModeChange
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
            placeholder="Tìm kiếm hoạt động..."
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Học kỳ:</span>
              <select
                value={semester}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="border-none bg-transparent text-sm font-semibold text-gray-900 focus:ring-0 focus:outline-none cursor-pointer"
              >
                {semesterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

            <button
              onClick={onToggleFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">Lọc nâng cao</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full min-w-[20px] text-center">
                  {activeFilterCount}
                </span>
              )}
              <span className={`text-xs transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium border-2 border-red-200 hover:border-red-300"
                title="Xóa tất cả bộ lọc"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Xóa lọc</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
              <ToggleButton
                active={viewMode === 'grid'}
                icon={Grid3X3}
                label="Lưới"
                onClick={() => onViewModeChange('grid')}
              />
              <ToggleButton
                active={viewMode === 'list'}
                icon={List}
                label="Danh sách"
                onClick={() => onViewModeChange('list')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
        active ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-700'
      }`}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

