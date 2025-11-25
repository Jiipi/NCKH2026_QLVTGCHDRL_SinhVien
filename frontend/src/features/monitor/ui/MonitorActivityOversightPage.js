import React from 'react';
import { Plus, Search, Filter, AlertCircle, SlidersHorizontal, RefreshCw, Grid3X3, List, Calendar, Clock, Award, Activity as ActivityIcon, CheckCircle, XCircle, UserPlus, Sparkles, X } from 'lucide-react';
import ActivityQRModal from '../../../components/ActivityQRModal';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import Pagination from '../../../shared/components/common/Pagination';
import ActivityCard from './components/Activities/ActivityCard';
import ActivityEditModal from './components/Activities/ActivityEditModal';
import { useMonitorActivityOversight } from '../model/hooks/useMonitorActivityOversight';

export default function MonitorActivityOversightPage() {
  const {
    activities,
    availableActivities,
    activityTypes,
    dashboardStats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedActivity,
    setSelectedActivity,
    showQRModal,
    setShowQRModal,
    showDetailModal,
    setShowDetailModal,
    showEditModal,
    setShowEditModal,
    editMode,
    setEditMode,
    displayViewMode,
    setDisplayViewMode,
    statusViewMode,
    setStatusViewMode,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    pagination,
    setPagination,
    availablePagination,
    setAvailablePagination,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    statusLabels,
    statusColors,
    getActiveFilterCount,
    clearAllFilters,
    parseDateSafe,
    hasEndedByTime,
    getDisplayStatus,
    isAvailable,
    formatDate,
    filteredActivities,
    approvedCount,
    availableCount,
    pendingCount,
    endedCount,
    totalActivitiesCount,
    tabCounts,
    handleCreateActivity,
    handleEditActivity,
    handleSaveActivity,
    handleDeleteActivity,
    handleRegister,
    handleViewDetails,
    handleShowQR,
    handleCloseEditModal
  } = useMonitorActivityOversight();

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

  return (
    <div className="space-y-6">
      {/* Ultra Modern Header - Neo-brutalism + Glassmorphism Hybrid */}
      <div className="relative min-h-[280px]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
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
                  <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-blue-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-blue-400">
                    ⚡ QUẢN LÝ LỚP
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {totalActivitiesCount} HOẠT ĐỘNG
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreateActivity}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-200 font-semibold ${isWritable ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl hover:shadow-2xl hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!isWritable}
              >
                <Plus className="h-5 w-5" />
                Tạo hoạt động
              </button>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ạ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Đ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ộ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">G</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-blue-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.5)]">
                    LỚP HỌC
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-blue-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Tổ chức và quản lý các hoạt động của lớp, theo dõi sinh viên tham gia
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Total */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <ActivityIcon className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{totalActivitiesCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 2 - Pending */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{pendingCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>

              {/* Card 3 - Approved */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{approvedCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>

              {/* Card 4 - Completed */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-purple-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Award className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{endedCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">KẾT THÚC</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style dangerouslySetInnerHTML={{__html: `
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
              placeholder="Tìm kiếm hoạt động..."
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
            
            {/* Right side: View mode toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                <button
                  onClick={() => setDisplayViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    displayViewMode === 'grid' 
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    displayViewMode === 'list' 
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      // Always use ID as value for consistent filtering
                      const typeValue = typeof type === 'string' ? type : (type?.id?.toString() || type?.name || type?.ten_loai_hd || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (
                        <option key={typeKey} value={typeValue}>{typeName}</option>
                      );
                    })}
                  </select>
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Tabs - Multiple View Modes */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          {/* Header với View Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle view mode button */}
              <button
                onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title="Chuyển chế độ hiển thị"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          {/* Pills Mode (Default) */}
          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('co_san')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'co_san'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Có sẵn
                {availableCount > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {availableCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('cho_duyet')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'cho_duyet'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Chờ duyệt
                {tabCounts.cho_duyet > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.cho_duyet}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('da_duyet')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'da_duyet'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Đã duyệt
                {tabCounts.da_duyet > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.da_duyet}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('ket_thuc')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'ket_thuc'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Award className="h-4 w-4" />
                Kết thúc
                {tabCounts.ket_thuc > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.ket_thuc}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('tu_choi')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'tu_choi'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Bị từ chối
                {tabCounts.tu_choi > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.tu_choi}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Dropdown Mode */}
          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
              >
                <option value="co_san">Có sẵn ({availableCount})</option>
                <option value="cho_duyet">Chờ duyệt ({tabCounts.cho_duyet})</option>
                <option value="da_duyet">Đã duyệt ({tabCounts.da_duyet})</option>
                <option value="ket_thuc">Kết thúc ({tabCounts.ket_thuc})</option>
                {/* Label corrected to Kết thúc */}
                {/* Keeping option order and value same */}
                <option value="tu_choi">Bị từ chối ({tabCounts.tu_choi})</option>
              </select>
              {(() => {
                const configs = {
                  co_san: { icon: UserPlus, gradient: 'from-emerald-500 to-green-500', count: availableCount },
                  cho_duyet: { icon: Clock, gradient: 'from-amber-500 to-orange-500', count: tabCounts.cho_duyet },
                  da_duyet: { icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500', count: tabCounts.da_duyet },
                  ket_thuc: { icon: Award, gradient: 'from-violet-500 to-purple-500', count: tabCounts.ket_thuc },
                  tu_choi: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: tabCounts.tu_choi }
                };
                const currentConfig = configs[statusFilter] || configs.cho_duyet;
                const CurrentIcon = currentConfig?.icon || Clock;
                return (
                  <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentConfig?.gradient || 'from-gray-400 to-gray-500'} text-white rounded-xl shadow-md`}>
                    <CurrentIcon className="h-4 w-4" />
                    <span className="font-bold text-sm">{currentConfig?.count || 0}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Compact Mode - Horizontal bar with badges */}
          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <button
                onClick={() => setStatusFilter('co_san')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'co_san' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Có sẵn"
              >
                <UserPlus className={`h-5 w-5 ${statusFilter === 'co_san' ? 'text-emerald-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'co_san' ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {availableCount}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('cho_duyet')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'cho_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Chờ duyệt"
              >
                <Clock className={`h-5 w-5 ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.cho_duyet}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('da_duyet')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'da_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Đã duyệt"
              >
                <CheckCircle className={`h-5 w-5 ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.da_duyet}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('ket_thuc')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'ket_thuc' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Đã tham gia"
              >
                <Award className={`h-5 w-5 ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.ket_thuc}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('tu_choi')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'tu_choi' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Bị từ chối"
              >
                <XCircle className={`h-5 w-5 ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.tu_choi}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activities Grid/List */}
      {filteredActivities.length > 0 ? (
        <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filteredActivities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              activity={activity}
              displayViewMode={displayViewMode}
              statusFilter={statusFilter}
              statusLabels={statusLabels}
              statusColors={statusColors}
              isWritable={isWritable}
              formatDate={formatDate}
              getDisplayStatus={getDisplayStatus}
              onViewDetails={handleViewDetails}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
              onShowQR={handleShowQR}
              onRegister={handleRegister}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hoạt động' : 'Chưa có hoạt động nào'}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || statusFilter !== 'all' 
                ? 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác'
                : 'Bắt đầu bằng cách tạo hoạt động đầu tiên cho lớp của bạn'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={handleCreateActivity}
                disabled={!isWritable}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold text-lg ${isWritable ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Plus className="h-6 w-6" />
                Tạo hoạt động đầu tiên
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      <ActivityEditModal
        isOpen={showEditModal}
        activity={selectedActivity}
        editMode={editMode}
        onClose={handleCloseEditModal}
        onEdit={() => setEditMode(true)}
        onSave={handleSaveActivity}
        onActivityChange={setSelectedActivity}
      />

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <ActivityDetailModal
          activityId={selectedActivity}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedActivity && (
        <ActivityQRModal
          activityId={selectedActivity.id}
          activityName={selectedActivity.ten_hd}
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {/* Pagination Controls - Pattern từ trang sinh viên */}
      {filteredActivities.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 mt-6">
          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
            itemLabel="hoạt động"
            showLimitSelector={true}
          />
        </div>
      )}
    </div>
  );
}

