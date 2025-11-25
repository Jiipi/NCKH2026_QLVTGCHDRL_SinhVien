import React from 'react';
import {
  Search,
  Calendar,
  SlidersHorizontal,
  RefreshCw,
  Grid3X3,
  List
} from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

export default function ActivitiesListToolbar({
  query,
  onQueryChange,
  onSearch,
  semester,
  semesterOptions = [],
  onSemesterChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  activeFilterCount = 0,
  viewMode,
  onViewModeChange
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>

      <div className="relative bg-white rounded-3xl border-2 border-gray-100 shadow-xl p-6">
        <form onSubmit={onSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="block w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              placeholder="Tìm kiếm hoạt động..."
            />
          </div>
        </form>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Học kỳ:</span>
              <div className="relative">
                <SemesterFilter
                  value={semester}
                  label=""
                  options={semesterOptions}
                  onChange={onSemesterChange}
                />
              </div>
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
              <ViewToggleButton
                label="Lưới"
                icon={Grid3X3}
                active={viewMode === 'grid'}
                onClick={() => onViewModeChange('grid')}
              />
              <ViewToggleButton
                label="Danh sách"
                icon={List}
                active={viewMode === 'list'}
                onClick={() => onViewModeChange('list')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewToggleButton({ label, icon: Icon, active, onClick }) {
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

