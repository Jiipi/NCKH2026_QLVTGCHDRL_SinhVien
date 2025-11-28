import React from 'react';
import {
  Search,
  Calendar,
  SlidersHorizontal,
  RefreshCw,
  Grid3X3,
  List,
  ArrowUpDown
} from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

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
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm sinh viên, MSSV hoặc tên hoạt động..."
            className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <SemesterFilter
              value={semester}
              onChange={onSemesterChange}
              label=""
              options={semesterOptions}
            />
          </div>

          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              showFilters
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
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
        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
          <ArrowUpDown className="h-4 w-4" />
          <span>Sắp xếp theo</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
          <button
            onClick={() => onDisplayViewModeChange?.('grid')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              displayViewMode === 'grid'
                ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            Lưới
          </button>
          <button
            onClick={() => onDisplayViewModeChange?.('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              displayViewMode === 'list'
                ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                : 'text-gray-500 hover:text-gray-700'
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


