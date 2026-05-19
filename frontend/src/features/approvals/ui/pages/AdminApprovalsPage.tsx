import React, { useState, useMemo } from 'react';
import {
  Globe, Building, Users, Clock, CheckCircle, XCircle, Award,
  Search, Filter, Calendar, RefreshCw, SlidersHorizontal, Grid3X3, List,
  Trophy, Sparkles, X, Shield
} from 'lucide-react';

// Hook & Services
import { useAdminApprovals } from '../../model/hooks/useAdminApprovals';
import { getStoredApprovalSemester } from '../../model/utils';
import { useSemesterData } from '../../../../shared/hooks';

// Shared Components (3-Tier Architecture)
import ActivityDetailModal from '../../../../entities/activity/ui/ActivityDetailModal';
import AdminRegistrationCard from '../shared/AdminRegistrationCard';
import Pagination from '../../../../shared/components/common/Pagination';
import { AdminPageHero } from '../../../../shared/components/admin';
import AppLoadingScreen from '../../../../shared/components/common/AppLoadingScreen';

// ============================================
// CONSTANTS
// ============================================
const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_tham_gia: 'Đã tham gia'
};

const STATUS_COLORS = {
  cho_duyet: 'border border-amber-200 bg-amber-50 text-amber-700',
  da_duyet: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  tu_choi: 'border border-rose-200 bg-rose-50 text-rose-700',
  da_tham_gia: 'border border-blue-200 bg-blue-50 text-blue-700'
};

const ROLE_DISPLAY = {
  ADMIN: 'Admin',
  GIANG_VIEN: 'Giảng viên',
  LOP_TRUONG: 'Lớp trưởng',
  SINH_VIEN: 'Sinh viên'
};

const formatRegistrationDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
};

const roleLabel = (role) => ROLE_DISPLAY[role] || role || 'Không rõ';

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminApprovalsPage() {
  const initialSemester = useMemo(() => getStoredApprovalSemester(), []);
  const { options: semesterOptions } = useSemesterData(initialSemester);

  const {
    loading,
    processing,
    error,
    semester,
    setSemester,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    scopeTab,
    setScopeTab,
    selectedClass,
    setSelectedClass,
    pagination,
    filteredRegistrations,
    activities,
    classes,
    stats,
    handleApprove,
    handleReject,
    handleBulkApprove,
    handleToggleSelect,
    handleToggleSelectAll,
    handlePageChange,
    handleLimitChange,
    clearAllFilters,
    getActiveFilterCount,
    refresh,
    SCOPE_OPTIONS,
    sortBy,
    setSortBy
  } = useAdminApprovals(initialSemester);

  const [activityDetailId, setActivityDetailId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [displayViewMode, setDisplayViewMode] = useState('grid');
  const [statusViewMode, setStatusViewMode] = useState('pills');

  const activeFilterCount = getActiveFilterCount();
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  // Backend already handles pagination, filteredRegistrations is the current page data
  const pendingInCurrentList = filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length;

  // Filter semester options based on scope tab
  // - Tab "Toàn hệ thống": Có option "Tất cả học kỳ" (value='')
  // - Tab "Theo lớp": Không có option "Tất cả học kỳ", chỉ các học kỳ cụ thể
  const filteredSemesterOptions = useMemo(() => {
    if (scopeTab === 'class') {
      // Remove "Tất cả học kỳ" option when filtering by class
      return semesterOptions.filter(opt => opt.value !== '');
    }
    return semesterOptions;
  }, [semesterOptions, scopeTab]);

  // When switching to class tab, ensure semester is not empty
  React.useEffect(() => {
    if (scopeTab === 'class' && semester === '' && filteredSemesterOptions.length > 0) {
      // Auto-select the first available semester
      setSemester(filteredSemesterOptions[0]?.value || '');
    }
  }, [scopeTab, semester, filteredSemesterOptions, setSemester]);

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHero
        eyebrow="Quản trị phê duyệt"
        title="Phê duyệt đăng ký"
        description="Phê duyệt, từ chối và theo dõi đăng ký tham gia hoạt động của sinh viên toàn hệ thống."
        heroIcon={Shield}
        metrics={[
          { icon: Clock, label: 'Chờ duyệt', value: stats.pending ?? 0, tone: 'text-amber-600 dark:text-amber-300' },
          { icon: CheckCircle, label: 'Đã duyệt', value: stats.approved ?? 0, tone: 'text-emerald-600 dark:text-emerald-300' },
          { icon: Trophy, label: 'Đã tham gia', value: stats.participated ?? 0, tone: 'text-indigo-600 dark:text-indigo-300' },
          { icon: XCircle, label: 'Từ chối', value: stats.rejected ?? 0, tone: 'text-rose-600 dark:text-rose-300' },
        ]}
      />

      {/* ============================================ */}
      {/* SCOPE SELECTOR (Admin specific) */}
      {/* ============================================ */}
      <div className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {SCOPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setScopeTab(option.value);
                if (option.value === 'all') setSelectedClass('');
              }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                scopeTab === option.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-white/70 bg-white/55 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white/75 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-indigo-300'
              }`}
            >
              {option.value === 'all' ? <Globe className="h-4 w-4" /> : <Building className="h-4 w-4" />}
              {option.label}
            </button>
          ))}
        </div>

        {scopeTab === 'class' && (
          <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 shadow-sm backdrop-blur-xl dark:border-indigo-400/20 dark:bg-indigo-400/10">
            <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
              Chọn lớp để xem đăng ký
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20 md:w-96"
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.ten_lop || cls.name} {cls.khoa ? `(${cls.khoa})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* SEARCH & FILTERS */}
      {/* ============================================ */}
      <div className="rounded-[2rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
        <div className="p-6">
          {/* Search bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-12 pr-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-indigo-400/20"
              placeholder="Tìm kiếm sinh viên, MSSV, email, hoạt động..."
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Activity Filter */}
              <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filters.activityId}
                  onChange={(e) => setFilters(prev => ({ ...prev, activityId: e.target.value }))}
                  className="cursor-pointer border-none bg-transparent text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 dark:text-slate-200"
                >
                  <option value="">Tất cả hoạt động</option>
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.ten_hd}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden h-8 w-px bg-white/60 dark:bg-white/10 lg:block"></div>

              {/* Advanced Filter Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm backdrop-blur-xl transition-all duration-200 hover:bg-white/75 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-indigo-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full min-w-[20px] text-center">
                    {activeFilterCount}
                  </span>
                )}
                <span className={`text-xs transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Clear filters button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-2.5 text-sm font-bold text-rose-600 shadow-sm backdrop-blur-xl transition-all duration-200 hover:bg-rose-100/80 hover:text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/15"
                  title="Xóa tất cả bộ lọc"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm">Xóa lọc</span>
                </button>
              )}
            </div>
            
            {/* Right side: Sort dropdown + View mode toggle */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400">Sắp xếp:</span>
                <select
                  value={sortBy || 'newest'}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cursor-pointer rounded-2xl border border-white/70 bg-white/55 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="name-az">Tên A → Z</option>
                  <option value="name-za">Tên Z → A</option>
                </select>
              </div>

              <div className="h-8 w-px bg-white/60 dark:bg-white/10"></div>

              <span className="whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400">Hiển thị:</span>
              <div className="flex items-center gap-1 rounded-2xl border border-white/70 bg-white/55 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <button
                  onClick={() => setDisplayViewMode('grid')}
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
                  onClick={() => setDisplayViewMode('list')}
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

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 animate-slideDown rounded-[2rem] border border-white/60 bg-white/45 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-black tracking-[-0.03em] text-slate-950 dark:text-white">
                  <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  Bộ lọc nâng cao
                </h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  title="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* MSSV */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">MSSV</label>
                  <input
                    type="text"
                    value={filters.mssv || ''}
                    onChange={e => setFilters({ ...filters, mssv: e.target.value })}
                    className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
                    placeholder="Nhập MSSV"
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Tên sinh viên</label>
                  <input
                    type="text"
                    value={filters.studentName || ''}
                    onChange={e => setFilters({ ...filters, studentName: e.target.value })}
                    className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
                    placeholder="Nhập tên sinh viên"
                  />
                </div>

                {/* From date */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Từ ngày</label>
                  <input
                    type="date"
                    value={filters.fromDate || ''}
                    onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                    className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
                  />
                </div>

                {/* To date */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Đến ngày</label>
                  <input
                    type="date"
                    value={filters.toDate || ''}
                    onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                    className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* STATUS TABS */}
      {/* ============================================ */}
      <div className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              <h3 className="text-base font-black tracking-[-0.03em] text-slate-950 dark:text-white">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')} 
                className="p-1 text-slate-400 transition-colors hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-300" 
                title="Chuyển chế độ hiển thị"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => { setActiveTab('pending'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'border border-white/70 bg-white/55 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <Clock className="h-4 w-4" />
                Chờ duyệt
                {stats.pending > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.pending}</span>)}
              </button>
              <button 
                onClick={() => { setActiveTab('approved'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-white/70 bg-white/55 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Đã duyệt
                {stats.approved > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.approved}</span>)}
              </button>
              <button 
                onClick={() => { setActiveTab('participated'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'participated'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-white/70 bg-white/55 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <Trophy className="h-4 w-4" />
                Đã tham gia
                {stats.participated > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.participated}</span>)}
              </button>
              <button 
                onClick={() => { setActiveTab('rejected'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'border border-white/70 bg-white/55 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Từ chối
                {stats.rejected > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.rejected}</span>)}
              </button>
            </div>
          )}

          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select 
                value={activeTab} 
                onChange={e => { setActiveTab(e.target.value); setSelectedIds([]); }} 
                className="flex-1 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white/75 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:ring-indigo-400/20"
              >
                <option value="pending">Chờ duyệt ({stats.pending})</option>
                <option value="approved">Đã duyệt ({stats.approved})</option>
                <option value="participated">Đã tham gia ({stats.participated})</option>
                <option value="rejected">Từ chối ({stats.rejected})</option>
              </select>
            </div>
          )}

          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/45 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <button 
                onClick={() => { setActiveTab('pending'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Chờ duyệt"
              >
                <Clock className={`h-5 w-5 ${activeTab === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.pending}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('approved'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Đã duyệt"
              >
                <CheckCircle className={`h-5 w-5 ${activeTab === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.approved}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('participated'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'participated' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Đã tham gia"
              >
                <Trophy className={`h-5 w-5 ${activeTab === 'participated' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'participated' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.participated}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('rejected'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Từ chối"
              >
                <XCircle className={`h-5 w-5 ${activeTab === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.rejected}</span>
              </button>
            </div>
          )}
      </div>

      {/* ============================================ */}
      {/* BULK ACTION TOOLBAR (only show for pending) */}
      {/* ============================================ */}
      {activeTab === 'pending' && pendingInCurrentList > 0 && (
        <div className="rounded-[2rem] border border-indigo-200/70 bg-indigo-50/70 p-4 shadow-sm backdrop-blur-2xl dark:border-indigo-400/20 dark:bg-indigo-400/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 transition-all hover:bg-white/50 dark:hover:bg-white/10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === pendingInCurrentList} 
                  onChange={handleToggleSelectAll} 
                  className="h-5 w-5 cursor-pointer rounded border-2 accent-indigo-600" 
                />
                <span className="font-bold text-slate-600 dark:text-slate-300">Chọn tất cả ({pendingInCurrentList})</span>
              </label>
              {selectedIds.length > 0 && (
                <span className="animate-pulse rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm">
                  ✓ Đã chọn: {selectedIds.length}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <button 
                    onClick={() => setSelectedIds([])} 
                    className="rounded-2xl border border-white/70 bg-white/55 px-4 py-2 font-bold text-slate-600 shadow-sm backdrop-blur-xl transition-colors hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    Bỏ chọn
                  </button>
                  <button 
                    onClick={handleBulkApprove} 
                    disabled={processing} 
                    className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2 font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {processing ? 'Đang xử lý...' : `Phê duyệt ${selectedIds.length} đăng ký`}
                  </button>
                </>
              ) : (
                <div className="text-sm italic text-slate-500 dark:text-slate-400">← Chọn các đăng ký để phê duyệt hàng loạt</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* REGISTRATIONS LIST */}
      {/* ============================================ */}
      <div>
        {filteredRegistrations.length > 0 ? (
          <div className={displayViewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-3'
          }>
            {filteredRegistrations.map(reg => {
              // Normalize registration data for RegistrationCard
              const normalizedReg = {
                ...reg,
                sinh_vien: reg.sinh_vien || reg.SinhVien || {},
                hoat_dong: reg.hoat_dong || reg.HoatDong || {}
              };
              
              return (
                <AdminRegistrationCard
                  key={reg.id}
                  registration={normalizedReg}
                  isSelected={selectedIds.includes(reg.id)}
                  isPending={reg.trang_thai_dk === 'cho_duyet'}
                  onToggleSelect={handleToggleSelect}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={(activityId) => setActivityDetailId(activityId)}
                  displayViewMode={displayViewMode}
                  statusColors={STATUS_COLORS}
                  statusLabels={STATUS_LABELS}
                  formatDate={formatRegistrationDate}
                  processing={processing}
                  roleLabel={roleLabel}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/60 bg-white/60 p-16 text-center shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                {activeTab === 'pending' && <Clock className="h-12 w-12 text-amber-600" />}
                {activeTab === 'approved' && <CheckCircle className="h-12 w-12 text-emerald-600" />}
                {activeTab === 'rejected' && <XCircle className="h-12 w-12 text-rose-600" />}
                {activeTab === 'participated' && <Trophy className="h-12 w-12 text-blue-600" />}
              </div>
              <h3 className="mb-3 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                {searchTerm ? 'Không tìm thấy đăng ký' : 
                  activeTab === 'pending' ? 'Không có đăng ký chờ duyệt' : 
                  activeTab === 'approved' ? 'Không có đăng ký đã duyệt' : 
                  activeTab === 'rejected' ? 'Không có đăng ký bị từ chối' : 
                  activeTab === 'participated' ? 'Không có đăng ký hoàn thành' : 
                  'Chưa có đăng ký nào'}
              </h3>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-300">
                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 
                  activeTab === 'pending' ? 'Tất cả đăng ký đã được xử lý' : 
                  activeTab === 'approved' ? 'Chưa có đăng ký nào được phê duyệt' : 
                  activeTab === 'rejected' ? 'Chưa có đăng ký nào bị từ chối' : 
                  activeTab === 'participated' ? 'Chưa có đăng ký nào hoàn thành' : 
                  'Chưa có sinh viên nào đăng ký hoạt động'}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="mt-6 rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
            <Pagination 
              pagination={{ 
                page: pagination.page, 
                limit: pagination.limit, 
                total: pagination.total 
              }} 
              onPageChange={handlePageChange} 
              onLimitChange={(newLimit) => { 
                handleLimitChange(newLimit); 
              }} 
              itemLabel="đăng ký" 
              showLimitSelector={true} 
            />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* ACTIVITY DETAIL MODAL */}
      {/* ============================================ */}
      <ActivityDetailModal
        activityId={activityDetailId}
        isOpen={!!activityDetailId}
        onClose={() => setActivityDetailId(null)}
      />
    </div>
  );
}
