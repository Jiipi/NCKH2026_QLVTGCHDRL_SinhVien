import React, { useState } from 'react';
import { UserCheck, UserX, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Eye, FileText, Sparkles, TrendingUp, Mail, Phone, Award, MapPin, BookOpen, Trophy, ArrowUp, ArrowDown, SlidersHorizontal, RefreshCw, Grid3X3, List, X } from 'lucide-react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import { ActivityQRModal } from '../../qr-attendance/ui/components';
import Pagination from '../../../shared/components/common/Pagination';
import RegistrationCard from './components/Approvals/RegistrationCard';
import { useMonitorApprovals } from '../model/hooks/useMonitorApprovals';

export default function MonitorApprovalsPage() {
  const {
    activityTypes,
    loading,
    processing,
    error,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    selectedDetail,
    setSelectedDetail,
    selectedIds,
    setSelectedIds,
    activityDetailId,
    setActivityDetailId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    displayViewMode,
    setDisplayViewMode,
    statusViewMode,
    setStatusViewMode,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    page,
    setPage,
    limit,
    setLimit,
    scrollDown,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    statusLabels,
    statusColors,
    formatDate,
    getActiveFilterCount,
    clearAllFilters,
    handleScrollToggle,
    roleLabel,
    filteredRegistrations,
    paginatedRegistrations,
    stats,
    handleToggleSelectAll,
    handleToggleSelect,
    handleApproveWithConfirm,
    handleRejectWithConfirm,
    handleBulkApproveWithConfirm,
    loadRegistrations,
    handleApprove,
    handleReject,
    handleBulkApprove
  } = useMonitorApprovals();

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrActivityId, setQrActivityId] = useState(null);
  const [qrActivityName, setQrActivityName] = useState('');

  const handleShowQR = (activityId) => {
    // Find activity name from registrations
    const reg = filteredRegistrations.find(r => r.hoat_dong?.id === activityId);
    setQrActivityId(activityId);
    setQrActivityName(reg?.hoat_dong?.ten_hd || 'Hoạt động');
    setQrModalOpen(true);
  };

  const handleCloseQR = () => {
    setQrModalOpen(false);
    setQrActivityId(null);
    setQrActivityName('');
  };

  const effectiveTotal = filteredRegistrations.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalRegistrations = stats.total;
  const pendingCount = stats.pending;
  const approvedCount = stats.approved;
  const completedCount = stats.participated;

  return (
    <div className="space-y-6">
      {/* Ultra Modern Header - Neo-brutalism + Glassmorphism Hybrid */}
      <div className="relative min-h-[280px]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

        {/* Main Content Container with Glassmorphism */}
        <div className="relative z-10 p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">

            {/* Top Bar with Badge */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-green-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-green-400">
                    ✓ PHÊ DUYỆT
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {totalRegistrations} ĐĂNG KÝ
                  </div>
                </div>
              </div>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">P</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ê</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">D</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Y</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ệ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]">
                    ĐĂNG KÝ
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-green-400/30 blur-sm"></div>
                </span>
              </h1>

              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Quản lý và phê duyệt đăng ký tham gia hoạt động của sinh viên
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Pending */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{pendingCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>

              {/* Card 2 - Approved */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{approvedCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>

              {/* Card 3 - Participated */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Trophy className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{completedCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ THAM GIA</p>
                </div>
              </div>

              {/* Card 4 - Rejected */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-red-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <XCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.rejected}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỪ CHỐI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}} />
      </div>

      {/* Tìm kiếm và Bộ lọc */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Thanh tìm kiếm */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
              placeholder="Tìm kiếm sinh viên, MSSV, email, hoạt động..."
            />
          </div>

          {/* Bộ lọc và Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Semester Filter */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Học kỳ:</span>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="border-none bg-transparent text-sm font-semibold text-gray-900 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  {semesterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

              {/* Advanced Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full min-w-[20px] text-center">
                    {getActiveFilterCount()}
                  </span>
                )}
                <span className={`text-xs transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Clear filters button */}
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium border-2 border-red-200 hover:border-red-300"
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
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                <button
                  onClick={() => setDisplayViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${displayViewMode === 'grid'
                      ? 'bg-white shadow-md text-blue-600 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Hiển thị dạng lưới"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
                <button
                  onClick={() => setDisplayViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${displayViewMode === 'list'
                      ? 'bg-white shadow-md text-blue-600 border border-blue-200'
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Bộ lọc nâng cao
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Loại hoạt động */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại hoạt động
                  </label>
                  <select
                    value={filters.type}
                    onChange={e => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">Tất cả loại</option>
                    {Array.isArray(activityTypes) && activityTypes.map(type => {
                      const typeName = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || '');
                      const typeValue = typeof type === 'string' ? type : (type?.id?.toString() || type?.name || type?.ten_loai_hd || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (
                        <option key={typeKey} value={typeValue}>{typeName}</option>
                      );
                    })}
                  </select>
                </div>

                {/* MSSV */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MSSV
                  </label>
                  <input
                    type="text"
                    value={filters.mssv}
                    onChange={e => setFilters({ ...filters, mssv: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Nhập MSSV"
                  />
                </div>

                {/* Từ ngày */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={e => setFilters({ ...filters, from: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  />
                </div>

                {/* Đến ngày */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={e => setFilters({ ...filters, to: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  />
                </div>

                {/* Điểm RL tối thiểu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm RL tối thiểu
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={filters.minPoints}
                    onChange={e => setFilters({ ...filters, minPoints: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Điểm RL tối đa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm RL tối đa
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={filters.maxPoints}
                    onChange={e => setFilters({ ...filters, maxPoints: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /><h3 className="text-base font-bold text-gray-900">Trạng thái</h3></div>
            <div className="flex items-center gap-2"><button onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')} className="p-1 text-gray-400 hover:text-purple-600 transition-colors" title="Chuyển chế độ hiển thị"><RefreshCw className="h-3.5 w-3.5" /></button></div>
          </div>
          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setViewMode('pending'); setSelectedIds([]); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Clock className="h-4 w-4" />Chờ duyệt{stats.pending > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.pending}</span>)}</button>
              <button onClick={() => { setViewMode('approved'); setSelectedIds([]); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><CheckCircle className="h-4 w-4" />Đã duyệt{stats.approved > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.approved}</span>)}</button>
              <button onClick={() => { setViewMode('completed'); setSelectedIds([]); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'completed' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Trophy className="h-4 w-4" />Đã tham gia{stats.participated > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.participated}</span>)}</button>
              <button onClick={() => { setViewMode('rejected'); setSelectedIds([]); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><XCircle className="h-4 w-4" />Từ chối{stats.rejected > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.rejected}</span>)}</button>
            </div>
          )}
          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select value={viewMode} onChange={e => { setViewMode(e.target.value); setSelectedIds([]); }} className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm">
                <option value="pending">Chờ duyệt ({stats.pending})</option>
                <option value="approved">Đã duyệt ({stats.approved})</option>
                <option value="completed">Đã tham gia ({stats.participated})</option>
                <option value="rejected">Từ chối ({stats.rejected})</option>
              </select>
              {(() => { const configs = { pending: { icon: Clock, gradient: 'from-yellow-500 to-orange-500', count: stats.pending }, approved: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', count: stats.approved }, completed: { icon: Trophy, gradient: 'from-blue-600 to-indigo-600', count: stats.participated }, rejected: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: stats.rejected } }; const currentConfig = configs[viewMode] || configs.pending; const CurrentIcon = currentConfig?.icon || Filter; return (<div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentConfig?.gradient || 'from-gray-400 to-gray-500'} text-white rounded-xl shadow-md`}><CurrentIcon className="h-4 w-4" /><span className="font-bold text-sm">{currentConfig?.count || 0}</span></div>); })()}
            </div>
          )}
          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <button onClick={() => { setViewMode('pending'); setSelectedIds([]); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg.white/50'}`} title="Chờ duyệt"><Clock className={`h-5 w-5 ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} /><span className={`text-xs font-bold ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.pending}</span></button>
              <button onClick={() => { setViewMode('approved'); setSelectedIds([]); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg.white/50'}`} title="Đã duyệt"><CheckCircle className={`h-5 w-5 ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} /><span className={`text-xs font-bold ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.approved}</span></button>
              <button onClick={() => { setViewMode('completed'); setSelectedIds([]); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'completed' ? 'bg-white shadow-md scale-105' : 'hover:bg.white/50'}`} title="Đã tham gia"><Trophy className={`h-5 w-5 ${viewMode === 'completed' ? 'text-purple-600' : 'text-gray-500'}`} /><span className={`text-xs font-bold ${viewMode === 'completed' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.participated}</span></button>
              <button onClick={() => { setViewMode('rejected'); setSelectedIds([]); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg.white/50'}`} title="Từ chối"><XCircle className={`h-5 w-5 ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} /><span className={`text-xs font-bold ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.rejected}</span></button>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'pending' && filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 rounded-lg px-3 py-2 transition-all">
                <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length} onChange={handleToggleSelectAll} className="w-5 h-5 rounded border-2 cursor-pointer accent-blue-600" />
                <span className="font-semibold text-gray-700">Chọn tất cả ({filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length})</span>
              </label>
              {selectedIds.length > 0 && (<span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold shadow-md animate-pulse">✓ Đã chọn: {selectedIds.length}</span>)}
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <button onClick={() => setSelectedIds([])} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Bỏ chọn</button>
                  <button onClick={handleBulkApprove} disabled={processing || !isWritable} className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><CheckCircle className="w-5 h-5" />{processing ? 'Đang xử lý...' : `Phê duyệt ${selectedIds.length} đăng ký`}</button>
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">← Chọn các đăng ký để phê duyệt hàng loạt</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        {effectiveTotal > 0 ? (
          <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
            {paginatedRegistrations.map(reg => (
              <RegistrationCard
                key={reg.id}
                registration={reg}
                isSelected={selectedIds.includes(reg.id)}
                isPending={reg.trang_thai_dk === 'cho_duyet'}
                onToggleSelect={handleToggleSelect}
                onApprove={handleApproveWithConfirm}
                onReject={handleRejectWithConfirm}
                onViewDetails={(activityId) => {
                  setActivityDetailId(activityId);
                  setIsDetailModalOpen(true);
                }}
                onShowQR={handleShowQR}
                displayViewMode={displayViewMode}
                statusColors={statusColors}
                statusLabels={statusLabels}
                formatDate={formatDate}
                processing={processing}
                roleLabel={roleLabel}
                isWritable={isWritable}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {viewMode === 'pending' && <Clock className="h-12 w-12 text-amber-600" />}
                {viewMode === 'approved' && <CheckCircle className="h-12 w-12 text-emerald-600" />}
                {viewMode === 'rejected' && <XCircle className="h-12 w-12 text-rose-600" />}
                {viewMode === 'completed' && <Trophy className="h-12 w-12 text-blue-600" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{searchTerm ? 'Không tìm thấy đăng ký' : viewMode === 'pending' ? 'Không có đăng ký chờ duyệt' : viewMode === 'approved' ? 'Không có đăng ký đã duyệt' : viewMode === 'rejected' ? 'Không có đăng ký bị từ chối' : viewMode === 'completed' ? 'Không có đăng ký hoàn thành' : 'Chưa có đăng ký nào'}</h3>
              <p className="text-gray-600 text-lg">{searchTerm ? 'Thử tìm kiếm với từ khóa khác' : viewMode === 'pending' ? 'Tất cả đăng ký đã được xử lý' : viewMode === 'approved' ? 'Chưa có đăng ký nào được phê duyệt' : viewMode === 'rejected' ? 'Chưa có đăng ký nào bị từ chối' : viewMode === 'completed' ? 'Chưa có đăng ký nào hoàn thành' : 'Chưa có sinh viên nào đăng ký hoạt động'}</p>
            </div>
          </div>
        )}
        {effectiveTotal > 0 && (
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 mt-6">
            <Pagination pagination={{ page, limit, total: effectiveTotal }} onPageChange={(newPage) => setPage(newPage)} onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }} itemLabel="đăng ký" showLimitSelector={true} />
          </div>
        )}
      </div>

      <ActivityDetailModal activityId={activityDetailId} isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setActivityDetailId(null); }} />
      <ActivityQRModal activityId={qrActivityId} activityName={qrActivityName} isOpen={qrModalOpen} onClose={handleCloseQR} />
    </div>
  );
}
