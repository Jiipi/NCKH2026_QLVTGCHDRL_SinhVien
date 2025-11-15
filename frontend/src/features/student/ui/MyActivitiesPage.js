import React from 'react';
import {
  Clock, CheckCircle, XCircle, Calendar, MapPin, Award, Users, Eye, AlertCircle,
  UserX, QrCode, ChevronRight, ChevronLeft, FileText, Trophy, Sparkles,
  RefreshCw, Search, SlidersHorizontal, Grid3X3, List
} from 'lucide-react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../../components/ActivityQRModal';
import { getActivityImage } from '../../../shared/lib/activityImages';
import useMyActivities from '../model/useMyActivities';

export default function MyActivitiesPage() {
  const {
    tab, setTab,
    data,
    loading, error,
    selectedActivityId, isModalOpen,
    qrModalOpen, qrActivityId, qrActivityName,
    query, setQuery,
    viewMode, setViewMode,
    showFilters, setShowFilters,
    filters, setFilters,
    activityTypes,
    statusViewMode, setStatusViewMode,
    pagination, setPagination,
    semester, setSemester,
    semesterOptions, isWritable,
    canShowQR,
    currentItems,
    paginatedItems,
    totalActivities,
    cancelRegistration,
    handleViewDetail,
    handleCloseModal,
    handleShowQR,
    handleCloseQRModal,
    getActiveFilterCount,
    clearAllFilters,
    handlePageChange
  } = useMyActivities();

  function ActivityCard({ activity, status, mode = 'grid' }) {
    const activityData = activity.hoat_dong || activity;
    const startDate = activityData.ngay_bd ? new Date(activityData.ngay_bd) : null;
    const registrationDate = activity.ngay_dang_ky ? new Date(activity.ngay_dang_ky) : null;
    const approvalDate = activity.ngay_duyet ? new Date(activity.ngay_duyet) : null;

    const statusConfig = {
      'pending': {
        icon: Clock,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-400',
        gradient: 'from-amber-400 to-orange-500',
        label: 'Chờ phê duyệt'
      },
      'approved': {
        icon: CheckCircle,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-400',
        gradient: 'from-emerald-400 to-green-500',
        label: 'Đã duyệt'
      },
      'joined': {
        icon: Trophy,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-400',
        gradient: 'from-blue-400 to-indigo-500',
        label: 'Đã tham gia'
      },
      'rejected': {
        icon: XCircle,
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        dot: 'bg-rose-400',
        gradient: 'from-rose-400 to-red-500',
        label: 'Bị từ chối'
      }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const StatusIcon = config.icon;

    if (mode === 'list') {
      return (
        <div className="group relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200`}></div>
          <div className={`relative bg-white border-2 ${config.border} rounded-xl hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-stretch gap-4 p-4">
              <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={getActivityImage(activityData.hinh_anh, activityData.loai || activityData.loai_hd?.ten_loai_hd)}
                  alt={activityData.ten_hd || activityData.name || 'Hoạt động'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = getActivityImage(null, activityData.loai || activityData.loai_hd?.ten_loai_hd); }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-white/90 backdrop-blur-sm ${config.text} shadow-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                    {config.label}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                    <Trophy className="h-3 w-3" />
                    +{activityData.diem_rl || activityData.diem || 0}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                    {activityData.ten_hd || activityData.name || 'Hoạt động'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {typeof activityData.loai === 'string'
                          ? activityData.loai
                          : (activityData.loai?.name || activityData.loai_hd?.ten_loai_hd || 'Chưa phân loại')}
                      </span>
                    </div>
                    {startDate && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                      </div>
                    )}
                    {activityData.dia_diem && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600 truncate">{activityData.dia_diem}</span>
                      </div>
                    )}
                  </div>
                  {status === 'rejected' && activity.ly_do_tu_choi && (
                    <div className="flex items-start gap-1.5 mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-red-600 line-clamp-1">{activity.ly_do_tu_choi}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleViewDetail(activityData.id || activity.hd_id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </button>
                {status === 'approved' && canShowQR && (
                  <button
                    onClick={() => handleShowQR(activityData.id || activity.hd_id, activityData.ten_hd || activityData.name || 'Hoạt động')}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <QrCode className="h-4 w-4" />
                    QR
                  </button>
                )}
                {status === 'pending' && (
                  <button
                    onClick={() => cancelRegistration(activity.id || activity.registration_id || activity.hd_id, activityData.ten_hd || activityData.name)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    disabled={!isWritable}
                  >
                    <UserX className="h-4 w-4" />
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative h-full">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
        <div className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col h-full`}>
          <div className="relative w-full h-36 overflow-hidden">
            <img
              src={getActivityImage(activityData.hinh_anh, activityData.loai || activityData.loai_hd?.ten_loai_hd)}
              alt={activityData.ten_hd || activityData.name || 'Hoạt động'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = getActivityImage(null, activityData.loai || activityData.loai_hd?.ten_loai_hd); }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm ${config.text} shadow-md`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
                <Trophy className="h-3 w-3" />
                +{activityData.diem_rl || activityData.diem || 0}
              </span>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1.5 leading-tight">
                {activityData.ten_hd || activityData.name || 'Hoạt động'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <Calendar className="h-3 w-3" />
                {typeof activityData.loai === 'string'
                  ? activityData.loai
                  : (activityData.loai?.name || activityData.loai_hd?.ten_loai_hd || 'Chưa phân loại')}
              </span>
            </div>
            <div className="space-y-1.5">
              {startDate && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    <p className="text-gray-500">{startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )}
              {activityData.dia_diem && (
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{activityData.dia_diem}</span>
                </div>
              )}
              {registrationDate && (
                <div className="flex items-center gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-600 truncate">ĐK: {registrationDate.toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {(status === 'approved' || status === 'joined') && approvalDate && (
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 truncate">Duyệt: {approvalDate.toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {status === 'rejected' && activity.ly_do_tu_choi && (
                <div className="flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded text-xs">
                  <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-red-600 line-clamp-2">{activity.ly_do_tu_choi}</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 pt-0 mt-auto flex gap-2">
            <button
              onClick={() => handleViewDetail(activityData.id || activity.hd_id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
            {status === 'approved' && canShowQR && (
              <button
                onClick={() => handleShowQR(activityData.id || activity.hd_id, activityData.ten_hd || activityData.name || 'Hoạt động')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
              >
                <QrCode className="h-3.5 w-3.5" />
                QR
              </button>
            )}
            {status === 'pending' && (
              <button
                onClick={() => cancelRegistration(activity.id || activity.registration_id || activity.hd_id, activityData.ten_hd || activityData.name)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!isWritable}
              >
                <UserX className="h-3.5 w-3.5" />
                Hủy
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const tabsConfig = [
    { key: 'pending', title: 'Chờ duyệt', icon: Clock, count: data.pending.length, gradient: 'from-amber-500 to-orange-600' },
    { key: 'approved', title: 'Đã duyệt', icon: CheckCircle, count: data.approved.length, gradient: 'from-emerald-500 to-green-600' },
    { key: 'joined', title: 'Đã tham gia', icon: Trophy, count: data.joined.length, gradient: 'from-blue-500 to-indigo-600' },
    { key: 'rejected', title: 'Bị từ chối', icon: XCircle, count: data.rejected.length, gradient: 'from-rose-500 to-red-600' }
  ];

  return (
    <div className="space-y-6" data-ref="student-my-activities-refactored">
      <div className="relative min-h-[280px]">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600"></div>
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
                    ⭐ CỦA TÔI
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {totalActivities} HOẠT ĐỘNG
                  </div>
                </div>
              </div>
            </div>

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
                  <span className="relative z-10 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                    CỦA TÔI
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div>
                </span>
              </h1>
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Theo dõi, quản lý và chinh phục các hoạt động rèn luyện bạn đã đăng ký
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{data.pending.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{data.approved.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Trophy className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{data.joined.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">THAM GIA</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-red-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <XCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{data.rejected.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỪ CHỐI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        `}} />
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
              placeholder="Tìm kiếm hoạt động..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Học kỳ:</span>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="border-none bg-transparent text-sm font-semibold text-gray-900 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  {(semesterOptions || []).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full min-w-[20px] text-center">{getActiveFilterCount()}</span>
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${viewMode === 'grid' ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Hiển thị dạng lưới"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Hiển thị dạng danh sách"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Bộ lọc nâng cao
                </h3>
                {getActiveFilterCount() > 0 && (
                  <span className="text-sm text-gray-600">Đang áp dụng <span className="font-bold text-blue-600">{getActiveFilterCount()}</span> bộ lọc</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Loại hoạt động
                  </label>
                  <select
                    value={filters.type}
                    onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
                  >
                    <option value="">Tất cả loại</option>
                    {(Array.isArray(activityTypes) ? activityTypes : []).map(type => {
                      const typeName = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || '');
                      const typeValue = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || type?.id || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (
                        <option key={typeKey} value={typeValue}>{typeName}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={e => setFilters(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:border-blue-300"
                  />
                </div>
                <div>
                  <label className="inline-flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={e => setFilters(prev => ({ ...prev, to: e.target.value }))}
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

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title="Chuyển chế độ hiển thị"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap items-center gap-2">
              {tabsConfig.map(config => (
                <button
                  key={config.key}
                  onClick={() => setTab(config.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    tab === config.key ? `bg-gradient-to-r ${config.gradient} text-white shadow-md` : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <config.icon className="h-4 w-4" />
                  <span className="text-sm">{config.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center ${tab === config.key ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {config.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select
                value={tab}
                onChange={e => setTab(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
              >
                {tabsConfig.map(config => (
                  <option key={config.key} value={config.key}>{config.title} ({config.count})</option>
                ))}
              </select>
              {(() => {
                const currentConfig = tabsConfig.find(c => c.key === tab);
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

          {statusViewMode === 'compact' && (
            <div className="flex items-center justify_between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              {tabsConfig.map(config => {
                const isActive = tab === config.key;
                return (
                  <button
                    key={config.key}
                    onClick={() => setTab(config.key)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`}
                    title={config.title}
                  >
                    <config.icon className={`h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>{config.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'approved' && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-700"><strong>Mẹo:</strong> Click "QR" để lấy mã điểm danh</span>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-pink-600 absolute inset-0"></div>
            <Clock className="absolute inset-0 m-auto h-6 w-6 text-purple-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Đang tải...</p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 rounded-xl p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-red-900 font-semibold">Đã xảy ra lỗi</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {(!loading && !error && currentItems.length === 0) && (
        <div className="text-center py-16">
          <div className="inline-block p-6 bg-gradient_to-br from-gray-50 to-blue-50 rounded-full mb-6">
            <Award className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có hoạt động nào</h3>
          <p className="text-gray-600 mb-6">Bạn chưa có hoạt động nào trong danh mục này</p>
        </div>
      )}

      {(!loading && !error && currentItems.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <span className="text-gray-700 font-semibold">
              Có <span className="text-purple-600 font-bold">{currentItems.length}</span> hoạt động
            </span>
            {(query || getActiveFilterCount() > 0) && (
              <span className="text-sm text-gray-500 italic">(Đã lọc từ {data[tab]?.filter(a => a.is_class_activity).length || 0} hoạt động)</span>
            )}
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
            {paginatedItems.map((activity, idx) => (
              <ActivityCard key={activity.id || activity.hd_id || idx} activity={activity} status={tab} mode={viewMode} />
            ))}
          </div>

          {pagination.total > 0 && (() => {
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
              <div className="mt-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  {pagination.total > 10 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị mỗi trang:</span>
                      <select
                        value={pagination.limit}
                        onChange={(e) => { setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 })); }}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg_white transition-all duration-200 hover:border-purple-300 text-sm font-medium"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 shadow-md hover:shadow-lg'}`}
                      title="Trang đầu"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-3" />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={`flex items_center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${currentPage <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 shadow-md hover:shadow-lg'}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </button>
                    {pageNumbers.map((pageNum) => {
                      if (typeof pageNum === 'string') return (<span key={pageNum} className="px-2 text-gray-400 font-bold">...</span>);
                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[44px] px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${pageNum === currentPage ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110 ring-2 ring-purple-300' : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${currentPage >= totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 shadow-md hover:shadow-lg'}`}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 shadow-md hover:shadow-lg'}`}
                      title="Trang cuối"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <ActivityDetailModal activityId={selectedActivityId} isOpen={isModalOpen} onClose={handleCloseModal} />
      <ActivityQRModal activityId={qrActivityId} activityName={qrActivityName} isOpen={qrModalOpen} onClose={handleCloseQRModal} />
    </div>
  );
}
