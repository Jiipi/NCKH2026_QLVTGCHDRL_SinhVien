import React from 'react';
import { Search, Filter, Grid3X3, List } from 'lucide-react';

export default function AdminUsersFilterBar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  roles = [],
  summaryText,
  sortBy,
  onSortChange,
  displayViewMode,
  onViewModeChange
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
      <div className="p-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-gray-100 border-2 border-gray-200 rounded-2xl px-4 py-2 text-sm font-semibold text-gray-700">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả vai trò</option>
              {roles.map((role) => (
                <option key={role.id || role.ten_vt} value={role.ten_vt}>
                  {role.ten_vt}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm font-semibold text-gray-500">{summaryText}</div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortBy || 'newest'}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-medium text-gray-700"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-az">Tên A → Z</option>
              <option value="name-za">Tên Z → A</option>
            </select>
          </div>

 	        <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200 ml-auto">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                displayViewMode === 'grid'
                  ? 'bg-white shadow-md text-violet-600 border border-violet-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Hiển thị dạng lưới"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Lưới</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                displayViewMode === 'list'
                  ? 'bg-white shadow-md text-violet-600 border border-violet-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Hiển thị dạng danh sách"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




