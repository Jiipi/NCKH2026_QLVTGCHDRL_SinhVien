import React from 'react';
import {
  Search,
  Calendar,
  SlidersHorizontal,
  RefreshCw,
  Grid3X3,
  List,
  Plus,
  Building,
  Globe,
  Filter,
  Lock
} from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

export default function AdminActivitiesToolbar({
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
  onViewModeChange,
  scopeTab,
  onScopeTabChange,
  classes = [],
  selectedClass,
  onClassChange,
  onCreateActivity,
  scopeOptions = [],
  sortBy,
  onSortChange,
  isWritable = true
}) {

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>

      <div className="relative bg-white rounded-3xl border-2 border-gray-100 shadow-xl p-6">
        {/* Search & Create Button */}
        <div className="flex gap-4 mb-6">
          <form onSubmit={onSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Tìm kiếm hoạt động, mô tả, địa điểm..."
              />
            </div>
          </form>
          <button
            onClick={onCreateActivity}
            disabled={!isWritable}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg font-semibold whitespace-nowrap ${
              isWritable 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={!isWritable ? 'Không thể tạo hoạt động cho học kỳ đã đóng' : 'Tạo hoạt động mới'}
          >
            {isWritable ? <Plus className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            Tạo hoạt động
          </button>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-gray-100 rounded-xl w-fit">
          {scopeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onScopeTabChange(option.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  scopeTab === option.value
                    ? 'bg-white shadow-md text-indigo-600 border border-indigo-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.value === 'all' ? <Globe className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                {option.label}
              </button>
            ))}
        </div>

        {/* Class Filter (only when scope is 'class') */}
        {scopeTab === 'class' && (
          <div className="mb-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
            <label className="block text-sm font-semibold text-indigo-700 mb-2">
              Chọn lớp để xem hoạt động:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full md:w-96 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((cls, index) => (
                <option key={cls.id || cls.ten_lop || `class-${index}`} value={cls.id || ''}>
                  {cls.ten_lop || cls.name} {cls.khoa ? `(${cls.khoa})` : ''}
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="text-xs text-indigo-600 mt-2">
                Không tìm thấy dữ liệu lớp. Vui lòng kiểm tra dữ liệu hoặc quyền truy cập.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
              <Calendar className="h-5 w-5 text-indigo-600 flex-shrink-0" />
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
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full min-w-[20px] text-center">
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
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy || 'newest'}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-medium text-gray-700"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name-az">Tên A → Z</option>
                <option value="name-za">Tên Z → A</option>
              </select>
            </div>

            <div className="w-px h-8 bg-gray-200"></div>

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
        active ? 'bg-white shadow-md text-indigo-600 border border-indigo-200' : 'text-gray-500 hover:text-gray-700'
      }`}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
