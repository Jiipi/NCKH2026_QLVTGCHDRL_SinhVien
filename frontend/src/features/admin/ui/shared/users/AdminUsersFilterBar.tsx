import React from 'react';
import { Search, Filter, Grid3X3, List } from 'lucide-react';

interface Role {
  id?: string;
  ten_vt?: string;
  ten_vai_tro?: string;
  name?: string;
  [key: string]: unknown;
}

interface AdminUsersFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  roles?: Role[];
  summaryText: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  displayViewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

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
}: AdminUsersFilterBarProps) {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="space-y-4 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-12 pr-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-indigo-400/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/55 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
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
              className="cursor-pointer rounded-2xl border border-white/70 bg-white/55 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-az">Tên A → Z</option>
              <option value="name-za">Tên Z → A</option>
            </select>
          </div>

 	        <div className="h-8 w-px bg-white/60 dark:bg-white/10" />

          <div className="ml-auto flex items-center gap-1 rounded-2xl border border-white/70 bg-white/55 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                displayViewMode === 'grid'
                  ? 'border border-indigo-200/70 bg-white text-indigo-600 shadow-sm dark:border-indigo-400/20 dark:bg-white/10 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
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
                  ? 'border border-indigo-200/70 bg-white text-indigo-600 shadow-sm dark:border-indigo-400/20 dark:bg-white/10 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
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










