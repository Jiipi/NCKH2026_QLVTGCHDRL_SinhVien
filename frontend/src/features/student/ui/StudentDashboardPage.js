import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Trophy, Clock, Star,
  Award, Target, Zap, CheckCircle, Filter,
  Activity, Sparkles, X, MapPin, XCircle
} from 'lucide-react';
import useStudentDashboard from '../model/useStudentDashboard';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const {
    semester,
    setSemester,
    recentFilter,
    setRecentFilter,
    recentActivities,
    selectedActivityState,
    showSummaryModalState,
    upcoming,
    myActivities,
    summary,
    userProfile,
    studentInfo,
    loading,
    classification,
    formatNumber,
  } = useStudentDashboard();

  const [selectedActivity, setSelectedActivity] = selectedActivityState;
  const [showSummaryModal, setShowSummaryModal] = showSummaryModalState;

  return (
    <div data-ref="student-dashboard-refactored" className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90 transform -translate-x-2 -translate-y-2" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                    <circle cx="40" cy="40" r="36" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray={String(2 * Math.PI * 36)} strokeDashoffset={String(2 * Math.PI * 36 * (1 - summary.progress / 100))} className="transition-all duration-1000 ease-out" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
                    {(userProfile?.anh_dai_dien || userProfile?.avatar) ? (
                      <img src={userProfile?.anh_dai_dien || userProfile?.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; const next = e.target.nextSibling; if (next) next.style.display = 'flex'; }} />
                    ) : null}
                    <span className={`text-2xl font-black text-white ${(userProfile?.anh_dai_dien || userProfile?.avatar) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                      {(userProfile?.ho_ten || userProfile?.name || 'DV').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
                    Xin chào, {(userProfile?.ho_ten || userProfile?.name || 'Sinh viên')}!
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                  </h1>
                  <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-black border-2 ${classification.bg} ${classification.color} ${classification.border}`}>
                      {classification.text}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                      {studentInfo.mssv || userProfile?.mssv || userProfile?.ma_sv || 'N/A'}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300">
                      {studentInfo.ten_lop || userProfile?.lop || userProfile?.ten_lop || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {!loading && (
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-3xl"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black p-4 rounded-3xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-5 w-5 text-black font-bold" />
                    <h3 className="text-base font-black text-black uppercase tracking-wider">BỘ LỌC HỌC KỲ</h3>
                  </div>
                  <div className="bg-white rounded-xl p-3 border-2 border-black shadow-lg">
                    <label className="block text-xs font-black text-gray-700 mb-1.5">Học kỳ</label>
                    <SemesterFilter value={semester ?? ''} onChange={setSemester} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div className="space-y-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 border-4 border-black p-3 rounded-xl transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                  <p className="text-white/90 font-black text-[10px] uppercase tracking-wider mb-1">TỔNG ĐIỂM RÈN LUYỆN</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-black text-white">{formatNumber(summary.totalPoints)}</p>
                    <p className="text-sm font-bold text-white/70">/100</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(summary.progress, 100)}%` }}></div>
                      </div>
                    </div>
                    <p className="text-white font-black text-lg ml-2">
                      <span className="text-[10px] font-bold text-white/80">TIẾN ĐỘ </span>
                      {formatNumber(summary.progress)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="group relative">
                  <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                  <div className="relative bg-yellow-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-5 h-5 text-black" />
                      <div className="bg-black text-yellow-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">THAM GIA</div>
                    </div>
                    <p className="text-3xl font-black text-black mb-0.5">{summary.activitiesJoined}</p>
                    <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                  <div className="relative bg-pink-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-black" />
                      <div className="bg-black text-pink-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">SẮP TỚI</div>
                    </div>
                    <p className="text-3xl font-black text-black mb-0.5">{summary.activitiesUpcoming}</p>
                    <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                  <div className="relative bg-blue-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="w-5 h-5 text-white" />
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-3xl font-black text-white mb-0.5">{summary.classRank}/{summary.totalStudents}</p>
                    <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">HẠNG LỚP</p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                  <div className="relative bg-green-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-black" />
                      <div className="bg-black text-green-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">MỤC TIÊU</div>
                    </div>
                    {summary.goalPoints > 0 ? (
                      <>
                        <p className="text-2xl font-black text-black mb-0.5">{summary.goalPoints}</p>
                        <p className="text-[9px] font-black text-black/80 uppercase tracking-wide leading-tight line-clamp-2">{summary.goalText}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-black mb-0.5">🎉</p>
                        <p className="text-[9px] font-black text-black/70 uppercase tracking-wider">ĐÃ ĐẠT XUẤT SẮC</p>
                      </>
                    )}
                  </div>
                </div>
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
          <p className="text-gray-700 font-semibold text-lg">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                  <Calendar className="w-5 h-5" />
                  Hoạt động sắp tới
                </div>
                <button onClick={() => navigate('/student/activities')} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Xem tất cả →</button>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                {upcoming.length > 0 ? (
                  upcoming.map((activity, idx) => {
                    const activityData = activity.activity || activity;
                    const daysUntil = activity.ngay_bd ? Math.ceil((new Date(activity.ngay_bd) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                      <div key={activity.id || idx} className="group/item cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200" onClick={() => { setSelectedActivity(activity); setShowSummaryModal(true); }}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{activityData.ten_hd || activityData.name || 'Hoạt động'}</h3>
                          <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold ml-2 whitespace-nowrap">{daysUntil !== null ? `+${daysUntil}d` : `+${formatNumber(activityData.diem_rl || 0)}đ`}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'N/A'}</span>
                          {(activity.dia_diem || activityData.dia_diem) && (
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{activity.dia_diem || activityData.dia_diem}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3"><Calendar className="w-6 h-6" /></div>
                    <p className="font-semibold text-gray-900">Chưa có hoạt động sắp tới</p>
                    <p className="text-gray-600 text-sm">Chọn học kỳ khác hoặc kiểm tra sau</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                  <Activity className="w-5 h-5" />
                  Hoạt động gần đây
                </div>
                <button onClick={() => navigate('/student/my-activities')} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Xem tất cả →</button>
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button onClick={() => setRecentFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${recentFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'}`}>Tất cả ({myActivities.all.length})</button>
                <button onClick={() => setRecentFilter('pending')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${recentFilter === 'pending' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'}`}>Chờ duyệt ({myActivities.pending.length})</button>
                <button onClick={() => setRecentFilter('approved')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${recentFilter === 'approved' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'}`}>Đã duyệt ({myActivities.approved.length})</button>
                <button onClick={() => setRecentFilter('joined')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${recentFilter === 'joined' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'}`}>Đã tham gia ({myActivities.joined.length})</button>
                <button onClick={() => setRecentFilter('rejected')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${recentFilter === 'rejected' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'}`}>Bị từ chối ({myActivities.rejected.length})</button>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => {
                    const activityData = activity.activity || activity;
                    const status = (activity.trang_thai_dk || activity.status || '').toLowerCase();
                    const isPending = status === 'cho_duyet' || status === 'pending';
                    const isApproved = status === 'da_duyet' || status === 'approved';
                    const isJoined = status === 'da_tham_gia' || status === 'participated' || status === 'attended';
                    const isRejected = status === 'tu_choi' || status === 'rejected';

                    let statusBadge = null;
                    let pointsBadge = null;
                    if (isPending) {
                      statusBadge = (<span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="h-3 w-3" />Chờ duyệt</span>);
                      pointsBadge = (<span className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">+{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}đ</span>);
                    } else if (isApproved) {
                      statusBadge = (<span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" />Đã duyệt</span>);
                      pointsBadge = (<span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">+{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}đ</span>);
                    } else if (isJoined) {
                      statusBadge = (<span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" />Đã tham gia</span>);
                      pointsBadge = (<span className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">+{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}đ</span>);
                    } else if (isRejected) {
                      statusBadge = (<span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="h-3 w-3" />Bị từ chối</span>);
                      pointsBadge = (<span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">+{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}đ</span>);
                    }

                    const location = activity.dia_diem || activityData.dia_diem || activity.activity?.dia_diem || activity.hoat_dong?.dia_diem || activityData.location || activity.location || 'N/A';
                    const displayDate = activity.ngay_tham_gia ? new Date(activity.ngay_tham_gia).toLocaleDateString('vi-VN') : activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : activityData.ngay_bd ? new Date(activityData.ngay_bd).toLocaleDateString('vi-VN') : activityData.ngay_tham_gia ? new Date(activityData.ngay_tham_gia).toLocaleDateString('vi-VN') : activity.hoat_dong?.ngay_bd ? new Date(activity.hoat_dong.ngay_bd).toLocaleDateString('vi-VN') : 'N/A';

                    return (
                      <div key={activity.id || activity.activity_id || idx} className="group/item cursor-pointer bg-gradient-to-br rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200" style={{ background: isPending ? 'linear-gradient(to bottom right, #fef9c3, #fef3c7)' : isApproved ? 'linear-gradient(to bottom right, #dcfce7, #d1fae5)' : isJoined ? 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)' : isRejected ? 'linear-gradient(to bottom right, #fee2e2, #fecaca)' : 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)' }} onClick={() => { setSelectedActivity(activity); setShowSummaryModal(true); }}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{activityData.ten_hd || activityData.name || 'Hoạt động'}</h3>
                          <div className="ml-2 flex items-center gap-2">{statusBadge}{pointsBadge}</div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{displayDate}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 font-medium">Không có hoạt động nào</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {showSummaryModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowSummaryModal(false); setSelectedActivity(null); }}>
          <div className="bg-white border-4 border-black rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900">Tóm tắt hoạt động</h2>
                <button onClick={() => { setShowSummaryModal(false); setSelectedActivity(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5 text-gray-700" /></button>
              </div>
              <div className="space-y-4">
                {(() => {
                  const activityData = selectedActivity.activity || selectedActivity.hoat_dong || selectedActivity;
                  const act = activityData || selectedActivity;
                  const activityName = act.ten_hd || act.name || activityData?.ten_hd || activityData?.name || selectedActivity.ten_hd || selectedActivity.name || 'Hoạt động';
                  const description = act.mo_ta || act.description || activityData?.mo_ta || activityData?.description || selectedActivity.mo_ta || selectedActivity.description || 'Không có mô tả';
                  const startDate = act.ngay_bd || activityData?.ngay_bd || selectedActivity.ngay_bd || selectedActivity.hoat_dong?.ngay_bd;
                  const endDate = act.ngay_kt || activityData?.ngay_kt || selectedActivity.ngay_kt || selectedActivity.hoat_dong?.ngay_kt;
                  const location = act.dia_diem || activityData?.dia_diem || selectedActivity.dia_diem || selectedActivity.hoat_dong?.dia_diem || selectedActivity.location;
                  const points = act.diem_rl || activityData?.diem_rl || selectedActivity.diem_rl || selectedActivity.hoat_dong?.diem_rl || act.diem || activityData?.diem || 0;
                  const status = (selectedActivity.trang_thai_dk || selectedActivity.status || '').toLowerCase();
                  return (
                    <>
                      <div>
                        <h3 className="font-black text-gray-900 mb-2">{activityName}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-600" /><div><p className="text-xs text-gray-500">Ngày bắt đầu</p><p className="text-sm font-bold text-gray-900">{startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'N/A'}</p></div></div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-600" /><div><p className="text-xs text-gray-500">Ngày kết thúc</p><p className="text-sm font-bold text-gray-900">{endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'N/A'}</p></div></div>
                        {location && (<div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-600" /><div><p className="text-xs text-gray-500">Địa điểm</p><p className="text-sm font-bold text-gray-900">{location}</p></div></div>)}
                        <div className="flex items-center gap-2"><Award className="h-4 w-4 text-gray-600" /><div><p className="text-xs text-gray-500">Điểm rèn luyện</p><p className="text-sm font-bold text-gray-900">{formatNumber(points)} điểm</p></div></div>
                        {status && (
                          <div className="flex items-center gap-2 col-span-2"><CheckCircle className="h-4 w-4 text-gray-600" /><div><p className="text-xs text-gray-500">Trạng thái</p><p className="text-sm font-bold text-gray-900">{status === 'cho_duyet' || status === 'pending' ? 'Chờ duyệt' : status === 'da_duyet' || status === 'approved' ? 'Đã duyệt' : status === 'da_tham_gia' || status === 'participated' ? 'Đã tham gia' : status === 'tu_choi' || status === 'rejected' ? 'Bị từ chối' : status}</p></div></div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => { setShowSummaryModal(false); setSelectedActivity(null); }} className="bg-black text-white px-6 py-2 rounded-lg font-black text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
