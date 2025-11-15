import React from 'react';
import {
  Search, Filter, Calendar, MapPin, Users, Clock, Award, Eye, UserPlus,
  ChevronRight, Grid3X3, List, SlidersHorizontal, ChevronLeft, Sparkles,
  TrendingUp, Star, Trophy, Zap, RefreshCw, AlertCircle, Info
} from 'lucide-react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import { getActivityImage } from '../../../shared/lib/activityImages';
import SemesterClosureBanner from '../../../components/SemesterClosureBanner';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import useStudentActivitiesList from '../model/useStudentActivitiesList';

export default function StudentActivitiesListPage() {
  const {
    // state
    query, setQuery,
    filters, setFilters,
    activityTypes,
    loading, error,
    viewMode, setViewMode,
    showFilters, setShowFilters,
    pagination, setPagination,
    role,
    selectedActivityId,
    isModalOpen,
    scopeTab,
    filteredItems,
    isTransitioning,
    activitiesGridRef,
    semester, setSemester,
    semesterOptions, isWritable,

    // actions
    onSearch,
    onFilterChange,
    getActiveFilterCount,
    clearAllFilters,
    handleRegister,
    handleViewDetail,
    handleCloseModal,
    handlePageChange,
    reload,

    // constants
    ACTIVITY_STATUS_OPTIONS
  } = useStudentActivitiesList();

  function parseDateSafe(d) {
    try { return d ? new Date(d) : null; } catch { return null; }
  }

  function ActivityCard({ activity, mode = 'grid' }) {
    const startDate = parseDateSafe(activity.ngay_bd) || new Date();
    const endDate = parseDateSafe(activity.ngay_kt) || startDate;
    const now = new Date();
    const isUpcoming = startDate > now;
    const isOngoing = startDate <= now && endDate >= now;
    const isPast = endDate < now;
    const deadline = activity.han_dk ? parseDateSafe(activity.han_dk) : null;
    const isDeadlinePast = deadline ? (deadline.getTime() < now.getTime()) : false;
    const isAfterStart = now.getTime() >= startDate.getTime();

    const registrationStatusConfig = {
      'cho_duyet': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Chờ duyệt' },
      'da_duyet': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Đã duyệt' },
      'tu_choi': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-400', label: 'Từ chối' },
      'da_tham_gia': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400', label: 'Đã tham gia' }
    };

    const activityStatusConfig = {
      'cho_duyet': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400', label: 'Chờ duyệt' },
      'da_duyet': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400', label: 'Đã mở' },
      'tu_choi': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400', label: 'Từ chối' },
      'ket_thuc': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400', label: 'Kết thúc' }
    };

    const status = activity.is_registered && activity.registration_status
      ? registrationStatusConfig[activity.registration_status] || activityStatusConfig['da_duyet']
      : activityStatusConfig[activity.trang_thai] || activityStatusConfig['da_duyet'];

    const timeStatus = isPast ? 'Đã kết thúc' : isOngoing ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Chưa xác định';
    const timeStatusColor = isPast ? 'text-slate-500' : isOngoing ? 'text-emerald-600' : isUpcoming ? 'text-blue-600' : 'text-slate-500';

    const canRegister = activity.trang_thai === 'da_duyet' && !isPast && !isDeadlinePast && !isAfterStart
      && (!activity.is_registered || activity.registration_status === 'tu_choi')
      && role !== 'giang_vien' && role !== 'teacher' && isWritable;
    const activityType = activity.loai || activity.loai_hd?.ten_loai_hd || 'Chưa phân loại';

    if (mode === 'list') {
      return (
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

          <div className="relative bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200">
            <div className="flex items-stretch gap-4 p-4">
              <div className="relative w-36 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
                  alt={activity.ten_hd}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${status.bg} ${status.text} border ${status.border} shadow-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    {status.label}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold w-fit">
                    <Trophy className="h-3 w-3" />
                    +{activity.diem_rl || 0}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1">
                      {activity.ten_hd || 'Hoạt động'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                      <Calendar className="h-3 w-3" />
                      {activityType}
                    </span>
                    <span className={`text-xs font-semibold ${timeStatusColor}`}>• {timeStatus}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-start gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs min-w-0">
                        <p className="text-gray-900 font-medium truncate">{startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                        <p className="text-gray-500">{startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600 truncate">{activity.dia_diem || 'Chưa xác định'}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Users className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600 truncate">{activity.don_vi_to_chuc || 'Nhà trường'}</span>
                    </div>
                  </div>
                </div>

                {((isDeadlinePast || isAfterStart) || (activity.registration_status === 'tu_choi' && activity.rejection_reason)) && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    {(isDeadlinePast || isAfterStart) && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        <span className="text-xs text-red-700 font-medium">Đã hết hạn đăng ký</span>
                      </div>
                    )}
                    {activity.registration_status === 'tu_choi' && activity.rejection_reason && (
                      <div className="flex items-start gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                        <Info className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-red-600 line-clamp-1 flex-1">{activity.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                {canRegister && (
                  <button
                    onClick={() => handleRegister(activity.id, activity.ten_hd)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[100px]"
                    title={activity.registration_status === 'tu_choi' ? 'Đăng ký lại' : 'Đăng ký'}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{activity.registration_status === 'tu_choi' ? 'ĐK lại' : 'Đăng ký'}</span>
                  </button>
                )}
                <button
                  onClick={() => handleViewDetail(activity.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[100px]"
                >
                  <Eye className="h-4 w-4" />
                  <span>Chi tiết</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>

        <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full">
          <div className="relative w-full h-36 overflow-hidden">
            <img
              src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
              alt={activity.ten_hd}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm ${status.text} shadow-md`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
                <Trophy className="h-3 w-3" />
                +{activity.diem_rl || 0}
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1.5 leading-tight">
                {activity.ten_hd || 'Hoạt động'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <Calendar className="h-3 w-3" />
                {activityType}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  <p className="text-gray-500">{startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate">{activity.dia_diem || 'Chưa xác định'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className={`text-xs font-semibold ${timeStatusColor}`}>• {timeStatus}</span>
              {(isDeadlinePast || isAfterStart) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 w-fit">
                  <AlertCircle className="h-3 w-3" />
                  Hết hạn ĐK
                </span>
              )}
              {activity.registration_status === 'tu_choi' && activity.rejection_reason && (
                <div className="flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded text-xs">
                  <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-red-600 line-clamp-2">{activity.rejection_reason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 pt-0 mt-auto flex gap-2">
            {canRegister && (
              <button
                onClick={() => handleRegister(activity.id, activity.ten_hd)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
                title={activity.registration_status === 'tu_choi' ? 'Đăng ký lại' : 'Đăng ký'}
              >
                <UserPlus className="h-3.5 w-3.5" />
                {activity.registration_status === 'tu_choi' ? 'ĐK lại' : 'Đăng ký'}
              </button>
            )}
            <button
              onClick={() => handleViewDetail(activity.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 ${canRegister ? '' : 'flex-1'}`}
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ref="student-activities-list-refactored">
      <SemesterClosureBanner />

      <div className="relative min-h-[280px]">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),\n                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>

        <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

        <div className="relative z-10 p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-yellow-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-yellow-400">
                    ⚡ HOẠT ĐỘNG
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    ĐANG CẬP NHẬT
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">K</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">M</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">P</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                    HOẠT ĐỘNG
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div>
                </span>
              </h1>

              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Nơi bạn khám phá, tham gia và chinh phục các thử thách rèn luyện của riêng mình
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-white border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="text-3xl font-black text-black">{pagination.total}</p>
                  <p className="text-xs font-black text-gray-600 uppercase tracking-wider">TỔNG SỐ</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Sparkles className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{pagination.total}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">KHẢ DỤNG</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-pink-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <TrendingUp className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">HOT</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">PHỔ BIẾN</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-cyan-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">SỚM</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">SẮP TỚI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        `}</style>
      </div>

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
                onChange={e => setQuery(e.target.value)}
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
                    onChange={(v) => { setSemester(v); setPagination(prev => ({ ...prev, page: 1 })); }}
                    label=""
                  />
                </div>
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

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

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md text-blue-600 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Hiển thị dạng lưới"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    viewMode === 'list'
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

          {showFilters && (
            <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Bộ lọc nâng cao
                </h3>
                {getActiveFilterCount() > 0 && (
                  <span className="text-sm text-gray-600">
                    Đang áp dụng <span className="font-bold text-blue-600">{getActiveFilterCount()}</span> bộ lọc
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Loại hoạt động
                  </label>
                  <select
                    value={filters.type}
                    onChange={e => {
                      const newFilters = { ...filters, type: e.target.value };
                      setFilters(newFilters);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
                  >
                    <option value="">Tất cả loại</option>
                    {(Array.isArray(activityTypes) ? activityTypes : []).map(type => (
                      <option key={type.id || type.ten_loai_hd} value={String(type.id || '')}>
                        {type.ten_loai_hd || type.name || 'Chưa có tên'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    Trạng thái
                  </label>
                  <select
                    value={filters.status}
                    onChange={e => {
                      const newFilters = { ...filters, status: e.target.value };
                      setFilters(newFilters);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
                  >
                    {ACTIVITY_STATUS_OPTIONS.map(option => (
                      <option key={option.value || 'all'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={e => {
                      const newFilters = { ...filters, from: e.target.value };
                      setFilters(newFilters);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
                  />
                </div>

                <div>
                  <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={e => {
                      const newFilters = { ...filters, to: e.target.value };
                      setFilters(newFilters);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {getActiveFilterCount() > 0 ? (
                    <span>✓ Đã áp dụng <strong>{getActiveFilterCount()}</strong> bộ lọc</span>
                  ) : (
                    <span>Chưa có bộ lọc nào được áp dụng</span>
                  )}
                </div>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Xóa tất cả
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute inset-0"></div>
            <Zap className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Đang tải danh sách...</p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 rounded-xl p-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-red-900 font-semibold">Đã xảy ra lỗi</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {(!loading && !error && filteredItems.length === 0) && (
        <div className="text-center py-16">
          <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
            <Users className="h-16 w-16 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Chưa có hoạt động nào
          </h3>
          <p className="text-gray-600 mb-6">
            Giảng viên chủ nhiệm hoặc lớp trưởng chưa tạo hoạt động nào
          </p>
          {scopeTab === 'in-class' && (
            <button
              onClick={() => {
                setQuery('');
                setFilters({ type: '', status: '', from: '', to: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
                reload();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="h-5 w-5" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {(!loading && !error && filteredItems.length > 0) && (
        <div
          ref={activitiesGridRef}
          className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          {isTransitioning && (
            <div className="flex items-center justify-center py-4 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-blue-700 font-medium">Đang tải...</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-semibold">
                Có <span className="text-green-600 font-bold">{filteredItems.length}</span> hoạt động lớp của bạn
              </span>
              {filteredItems.length <= pagination.limit && filteredItems.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Hiển thị đầy đủ
                </span>
              )}
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
            {filteredItems.map((activity, idx) => (
              <ActivityCard key={activity.id || idx} activity={activity} mode={viewMode} />
            ))}
          </div>

          {pagination.total > 0 && (() => {
            const totalPages = Math.ceil(pagination.total / pagination.limit);
            const currentPage = pagination.page;
            const hasMultiplePages = totalPages > 1;
            return (
              <div className="mt-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  {pagination.total > 10 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị mỗi trang:</span>
                      <select
                        value={pagination.limit}
                        onChange={(e) => { setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 })); }}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300 text-sm font-medium"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  )}

                  <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {(() => {
                      const totalPages = Math.ceil(pagination.total / pagination.limit);
                      const currentPage = pagination.page;
                      const getPageNumbers = () => {
                        const pages = [];
                        const maxVisible = 7;
                        if (totalPages <= maxVisible) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          const leftSiblings = 2;
                          const rightSiblings = 2;
                          const leftBound = Math.max(2, currentPage - leftSiblings);
                          const rightBound = Math.min(totalPages - 1, currentPage + rightSiblings);
                          if (leftBound > 2) pages.push('ellipsis-left');
                          for (let i = leftBound; i <= rightBound; i++) pages.push(i);
                          if (rightBound < totalPages - 1) pages.push('ellipsis-right');
                          pages.push(totalPages);
                        }
                        return pages;
                      };
                      const pageNumbers = getPageNumbers();
                      return (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                              currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
                            }`}
                            title="Trang đầu"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <ChevronLeft className="h-4 w-4 -ml-3" />
                          </button>

                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                              currentPage <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Trước
                          </button>

                          {pageNumbers.map((pageNum) => {
                            if (typeof pageNum === 'string') {
                              return (
                                <span key={pageNum} className="px-2 text-gray-400 font-bold">...</span>
                              );
                            }
                            return (
                              <button
                                key={`page-${pageNum}`}
                                onClick={() => handlePageChange(pageNum)}
                                className={`min-w-[44px] px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                                  pageNum === currentPage
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110 ring-2 ring-blue-300'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                              currentPage >= totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
                            }`}
                          >
                            Sau
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                              currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 shadow-md hover:shadow-lg'
                            }`}
                            title="Trang cuối"
                          >
                            <ChevronRight className="h-4 w-4" />
                            <ChevronRight className="h-4 w-4 -ml-3" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <ActivityDetailModal
        activityId={selectedActivityId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
