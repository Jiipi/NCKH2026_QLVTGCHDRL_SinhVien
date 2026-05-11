import React from 'react';
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Grid3X3,
  List,
  Plus,
  Building,
  Globe,
  Filter,
  Lock,
  LucideIcon
} from 'lucide-react';
interface SemesterOption {
  value?: string;
  label: string;
}

interface ScopeOption {
  value: string;
  label: string;
}

interface ClassItem {
  id?: string;
  ten_lop?: string;
  name?: string;
  khoa?: string;
}

interface AdminActivitiesToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  semester: string;
  semesterOptions?: SemesterOption[];
  onSemesterChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  scopeTab: string;
  onScopeTabChange: (value: string) => void;
  classes?: ClassItem[];
  selectedClass: string;
  onClassChange: (value: string) => void;
  onCreateActivity: () => void;
  scopeOptions?: ScopeOption[];
  sortBy?: string;
  onSortChange?: (value: string) => void;
  isWritable?: boolean;
}

interface ViewToggleButtonProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export default function AdminActivitiesToolbar({
  query,
  onQueryChange,
  onSearch,
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
}: AdminActivitiesToolbarProps): React.ReactElement {

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.14),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(45,212,191,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_100%_20%,rgba(20,184,166,0.10),transparent_26%)]" />
        <div className="relative z-10">
        {/* Search & Create Button */}
        <div className="flex flex-col gap-4 border-b border-white/60 pb-5 lg:flex-row lg:items-center dark:border-white/10">
          <form onSubmit={onSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="block w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/75 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:focus:border-indigo-400/60 dark:focus:bg-white/10 dark:focus:ring-indigo-500/10"
                placeholder="Tìm kiếm hoạt động, mô tả, địa điểm..."
              />
            </div>
          </form>
          <button
            onClick={onCreateActivity}
            disabled={!isWritable}
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold tracking-[-0.01em] whitespace-nowrap transition-all duration-200 ${
              isWritable
                ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950'
                : 'cursor-not-allowed border border-white/60 bg-white/40 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-600'
            }`}
            title={!isWritable ? 'Không thể tạo hoạt động cho học kỳ đã đóng' : 'Tạo hoạt động mới'}
          >
            {isWritable ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            Tạo hoạt động
          </button>
        </div>

        {/* Scope Tabs */}
        <div className="flex w-fit items-center gap-2 border-b border-white/60 py-4 dark:border-white/10">
          {scopeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onScopeTabChange(option.value)}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                  scopeTab === option.value
                    ? 'border border-white/70 bg-white/70 text-indigo-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200'
                }`}
              >
                {option.value === 'all' ? <Globe className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                {option.label}
              </button>
            ))}
        </div>

        {/* Class Filter (only when scope is 'class') */}
        {scopeTab === 'class' && (
          <div className="my-5 rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Chọn lớp để xem hoạt động
            </label>
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full rounded-xl border border-white/70 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-indigo-500/10 md:w-96"
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((cls, index) => (
                <option key={cls.id || cls.ten_lop || `class-${index}`} value={cls.id || ''}>
                  {cls.ten_lop || cls.name} {cls.khoa ? `(${cls.khoa})` : ''}
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Không tìm thấy dữ liệu lớp. Vui lòng kiểm tra dữ liệu hoặc quyền truy cập.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-start justify-between gap-5 pt-5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onToggleFilters}
              className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/35 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">Lọc nâng cao</span>
              {activeFilterCount > 0 && (
                <span className="min-w-[20px] rounded-full bg-indigo-600 px-2 py-0.5 text-center text-xs font-bold text-white shadow-sm shadow-indigo-500/30">
                  {activeFilterCount}
                </span>
              )}
              <span className={`text-xs transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-2 rounded-2xl border border-rose-200/70 bg-white/35 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-50/80 dark:border-rose-400/20 dark:bg-white/5 dark:text-rose-300 dark:hover:bg-rose-500/10"
                title="Xóa tất cả bộ lọc"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Xóa lọc</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">Sắp xếp</span>
              <select
                value={sortBy || 'newest'}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="cursor-pointer rounded-xl border border-white/60 bg-white/45 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-indigo-500/10"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name-az">Tên A → Z</option>
                <option value="name-za">Tên Z → A</option>
              </select>
            </div>

            <div className="h-8 w-px bg-white/60 dark:bg-white/10"></div>

            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">Hiển thị</span>
            <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/35 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
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
    </div>
  );
}

function ViewToggleButton({ label, icon: Icon, active, onClick }: ViewToggleButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
        active ? 'bg-white/80 text-indigo-700 shadow-sm backdrop-blur-xl dark:bg-white/15 dark:text-indigo-300' : 'text-slate-500 hover:bg-white/45 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
      }`}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
