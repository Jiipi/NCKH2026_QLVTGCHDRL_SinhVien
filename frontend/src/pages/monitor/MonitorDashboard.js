import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, Activity, AlertCircle, Trophy, MapPin, Filter, Zap, Target, Star, Sparkles, CheckCircle, XCircle
} from 'lucide-react';
import ActivityDetailModal from '../../components/ActivityDetailModal';
import SemesterClosureWidget from '../../components/SemesterClosureWidget';
import useSemesterData from '../../hooks/useSemesterData';
import useDashboardData from '../../hooks/useDashboardData';
import SemesterFilter from '../../components/SemesterFilter';

export default function MonitorDashboard() {
  const navigate = useNavigate();
  
  // Modal states
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'recent'
  
  // Semester filter synced with backend current + session cache
  const [semester, setSemester] = useState(() => {
    const cached = sessionStorage.getItem('current_semester');
    return cached || '';
  });

  // Unified semester options from backend
  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);

  // ✅ USE SHARED HOOK - Replaces ~200 lines of manual state + fetch logic
  const { 
    upcoming,
    myActivities, 
    summary, 
    userProfile, 
    topStudents,
    classSummary,
    approvals,
    loading 
  } = useDashboardData({ semester, role: 'monitor' });

  // Keep selected semester in sync with backend-reported current active
  useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester]);

  // Persist selection for other pages/tabs in the session
  useEffect(() => {
    if (semester) {
      try { sessionStorage.setItem('current_semester', semester); } catch (_) {}
    }
  }, [semester]);

  // Event handlers
  const handleActivityClick = (activityId) => {
    setSelectedActivity(activityId);
    setShowActivityModal(true);
  };

  const handleCloseModal = () => {
    setShowActivityModal(false);
    setSelectedActivity(null);
  };

  // Format number helper
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Math.round(num * 10) / 10;
  };

  // Format semester display
  const getSemesterDisplay = (semester) => {
    if (semester === 'hoc_ky_1') return 'Học kỳ 1';
    if (semester === 'hoc_ky_2') return 'Học kỳ 2';
    if (semester === 'hoc_ky_he') return 'Học kỳ hè';
    return semester;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  // Derive display values from hook data
  const monitorName = userProfile?.ho_ten || userProfile?.name || 'Lớp trưởng';
  const upcomingActivities = upcoming || [];
  const recentApprovals = myActivities?.all || [];
  
  // Monitor's PERSONAL stats (summary from hook)
  const monitorPoints = Math.round(summary?.totalPoints || 0);
  const activitiesJoined = summary?.activitiesJoined || 0;
  const pendingActivities = myActivities?.pending?.length || 0;
  const classRank = summary?.classRank || 1;
  const goalPoints = summary?.goalPoints || 0;
  const goalText = summary?.goalText || '';
  
  // Progress based on monitor's personal points
  const progressPercent = Math.min(Math.round((monitorPoints / 100) * 100), 100);
  const totalPointsProgress = Math.min((monitorPoints / 100) * 100, 100);
  
  // Class-level stats - FROM CLASS DASHBOARD
  const totalStudents = summary?.totalStudents || classSummary?.totalStudents || 0;
  const pendingApprovals = approvals?.pending || 0;
  const totalActivities = classSummary?.totalActivitiesCount || classSummary?.approvedCount || 0;
  
  // Get classification based on MONITOR'S personal points
  const getClassification = (points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };
  const classification = getClassification(monitorPoints);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      {/* Main Header Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* BÊN TRÁI: Greeting + Semester Filter & Closure (Neo-brutalism) */}
          <div className="space-y-4">
            {/* Greeting Section với Avatar - Giống Student Dashboard */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                {/* Avatar với progress circle */}
                <div className="relative flex-shrink-0">
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90 transform -translate-x-2 -translate-y-2" viewBox="0 0 80 80">
                    {/* Background circle - vòng nền xám nhạt */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    {/* Progress circle - vòng tiến độ gradient */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="url(#monitorGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressPercent / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="monitorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Avatar - hiển thị ảnh hoặc chữ cái */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
                    {userProfile?.anh_dai_dien || userProfile?.avatar ? (
                      <img 
                        src={userProfile?.anh_dai_dien || userProfile?.avatar} 
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl font-black text-white ${(userProfile?.anh_dai_dien || userProfile?.avatar) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                      {(monitorName || 'LT').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
                    Xin chào, {monitorName}! 
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                  </h1>
                  <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>
                  
                  {/* Badges - Xếp loại CÁ NHÂN, Tên lớp, Số sinh viên */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-black border-2 ${classification.bg} ${classification.color} ${classification.border}`}>
                      {classification.text} • {monitorPoints} điểm
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300">
                      {summary?.className || 'N/A'}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                      {totalStudents} sinh viên
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* BỘ LỌC HỌC KỲ + ĐỀ XUẤT ĐÓNG HỌC KỲ - Neo-brutalism */}
            {!loading && (
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-3xl"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black p-4 rounded-3xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-5 w-5 text-black font-bold" />
                    <h3 className="text-base font-black text-black uppercase tracking-wider">BỘ LỌC HỌC KỲ</h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-3 border-2 border-black shadow-lg mb-3">
                    <SemesterFilter value={semester} onChange={setSemester} label="" />
                  </div>

                  {/* Semester Closure Widget - Gộp vào đây */}
                  <div className="bg-white/90 rounded-xl p-3 border-2 border-black">
                    <SemesterClosureWidget 
                      compact 
                      enableSoftLock={false} 
                      enableHardLock={false}
                      className="!p-0 !bg-transparent !border-0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BÊN PHẢI: Grid Cards 3 cột - Đồng bộ theo trang sinh viên */}
          {!loading && (
            <div className="grid grid-cols-3 gap-3">
              
              {/* Card 1: TỔNG ĐIỂM - Chiếm 2 cột, hàng 1 */}
              <div className="col-span-2 group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 border-4 border-black p-3 rounded-xl transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full">
                  <p className="text-white/90 font-black text-[10px] uppercase tracking-wider mb-1">ĐIỂM CÁ NHÂN CỦA TÔI</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-black text-white">{formatNumber(monitorPoints)}</p>
                    <p className="text-sm font-bold text-white/70">/100</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(totalPointsProgress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-white font-black text-lg ml-2">
                      <span className="text-[10px] font-bold text-white/80">TIẾN ĐỘ </span>
                      {formatNumber(totalPointsProgress)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: TỔNG SỐ SINH VIÊN - 1 cột, hàng 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-blue-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-white" />
                    <div className="bg-black text-blue-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      LỚP HỌC
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mb-0.5">{totalStudents}</p>
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">SINH VIÊN</p>
                </div>
              </div>

              {/* Card 3: THAM GIA - VÀNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-5 h-5 text-black" />
                    <div className="bg-black text-yellow-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      THAM GIA
                    </div>
                  </div>
                  <p className="text-3xl font-black text-black mb-0.5">{activitiesJoined}</p>
                  <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 4: CHỜ DUYỆT - CAM */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-orange-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-5 h-5 text-black" />
                    {pendingApprovals > 0 && (
                      <div className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                        <span className="text-red-600 font-black text-xs animate-pulse">!</span>
                      </div>
                    )}
                  </div>
                  <p className="text-3xl font-black text-black mb-0.5">{pendingApprovals}</p>
                  <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>

              {/* Card 5: ĐÃ DUYỆT - TÍM */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-purple-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-white" />
                    <div className="bg-black text-purple-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      ĐÃ DUYỆT
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mb-0.5">{totalActivities}</p>
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">HOẠT ĐỘNG LỚP</p>
                </div>
              </div>

              {/* Card 6: SẮP TỚI - HỒNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-pink-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-black" />
                    <div className="bg-black text-pink-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      SẮP TỚI
                    </div>
                  </div>
                  <p className="text-3xl font-black text-black mb-0.5">{upcomingActivities?.length || 0}</p>
                  <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 7: HẠNG LỚP - XANH DƯƠNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-blue-500 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-5 h-5 text-white" />
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-3xl font-black text-white mb-0.5">{classRank}/{totalStudents}</p>
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">HẠNG CỦA TÔI</p>
                </div>
              </div>

              {/* Card 8: MỤC TIÊU - XANH LÁ */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-black" />
                    <div className="bg-black text-green-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      MỤC TIÊU
                    </div>
                  </div>
                  {goalPoints > 0 ? (
                    <>
                      <p className="text-2xl font-black text-black mb-0.5">{goalPoints}</p>
                      <p className="text-[9px] font-black text-black/80 uppercase tracking-wide leading-tight line-clamp-2">
                        {goalText}
                      </p>
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
        <div className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Activities with Tabs (2/3) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {/* Tabs */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm transition-all ${
                      activeTab === 'upcoming'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    Hoạt động sắp diễn ra
                  </button>
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm transition-all ${
                      activeTab === 'recent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    Hoạt động gần đây
                  </button>
                </div>
                <button 
                  onClick={() => navigate('/class/activities')}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Xem tất cả →
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                {activeTab === 'upcoming' ? (
                  upcomingActivities && upcomingActivities.length > 0 ? (
                    upcomingActivities.map(activity => (
                      <div 
                        key={activity.id}
                        onClick={() => handleActivityClick(activity.id)}
                        className="group/item cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{activity.ten_hd}</h3>
                          <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold ml-2 whitespace-nowrap">
                            +{activity.diem_rl} điểm
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}
                          </span>
                          {activity.dia_diem && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {activity.dia_diem}
                            </span>
                          )}
                          {activity.registeredStudents > 0 && (
                            <span className="flex items-center gap-1 ml-auto text-blue-600">
                              <Users className="h-3.5 w-3.5" />
                              {activity.registeredStudents} SV
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="mb-2">Chưa có hoạt động sắp diễn ra</p>
                      <button 
                        onClick={() => navigate('/class/activities/create')}
                        className="mt-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Tạo hoạt động đầu tiên →
                      </button>
                    </div>
                  )
                ) : (
                  // Recent Activities Tab - Hiển thị "Hoạt động của tôi" giống student dashboard
                  recentApprovals && recentApprovals.length > 0 ? (
                    recentApprovals.map((activity, idx) => {
                      // Lấy dữ liệu hoạt động từ nested object hoặc chính activity
                      const activityData = activity.activity || activity.hoat_dong || activity;
                      const status = (activity.trang_thai_dk || activity.status || '').toLowerCase();
                      
                      // Xác định status types
                      const isPending = status === 'cho_duyet' || status === 'pending';
                      const isApproved = status === 'da_duyet' || status === 'approved';
                      const isJoined = status === 'da_tham_gia' || status === 'participated' || status === 'attended';
                      const isRejected = status === 'tu_choi' || status === 'rejected';
                      
                      // Background color based on status
                      let bgColor = 'from-blue-50 to-indigo-50';
                      if (isPending) bgColor = 'from-yellow-50 to-orange-50';
                      else if (isApproved) bgColor = 'from-green-50 to-emerald-50';
                      else if (isJoined) bgColor = 'from-blue-50 to-cyan-50';
                      else if (isRejected) bgColor = 'from-red-50 to-pink-50';
                      
                      // Status badge với design mềm mại giống student
                      let statusBadge = null;
                      let pointsBadge = null;
                      const points = activityData.diem_rl || activity.diem_rl || 0;
                      
                      if (isPending) {
                        statusBadge = (
                          <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Chờ duyệt
                          </span>
                        );
                        pointsBadge = (
                          <span className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                            +{formatNumber(points)}d
                          </span>
                        );
                      } else if (isApproved) {
                        statusBadge = (
                          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Đã duyệt
                          </span>
                        );
                        pointsBadge = (
                          <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                            +{formatNumber(points)}d
                          </span>
                        );
                      } else if (isJoined) {
                        statusBadge = (
                          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Đã tham gia
                          </span>
                        );
                        pointsBadge = (
                          <span className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                            +{formatNumber(points)}d
                          </span>
                        );
                      } else if (isRejected) {
                        statusBadge = (
                          <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Bị từ chối
                          </span>
                        );
                      }
                      
                      // Lấy các fields từ nhiều nguồn có thể
                      const activityName = activityData.ten_hd || activity.ten_hd || 'Hoạt động';
                      const location = activity.dia_diem 
                        || activityData.dia_diem 
                        || activity.activity?.dia_diem 
                        || activity.hoat_dong?.dia_diem
                        || activityData.location
                        || '';
                      
                      // Lấy ngày từ nhiều nguồn có thể
                      const displayDate = activity.ngay_tham_gia 
                        ? new Date(activity.ngay_tham_gia).toLocaleDateString('vi-VN')
                        : activity.ngay_bd
                        ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN')
                        : activityData.ngay_bd
                        ? new Date(activityData.ngay_bd).toLocaleDateString('vi-VN')
                        : activityData.ngay_kt
                        ? new Date(activityData.ngay_kt).toLocaleDateString('vi-VN')
                        : 'N/A';
                      
                      // ID cho modal - ưu tiên activity_id nếu có
                      const activityId = activity.activity_id || activityData.id || activity.id;
                      
                      return (
                        <div 
                          key={activity.id || idx}
                          onClick={() => activityId && handleActivityClick(activityId)}
                          className={`group/item cursor-pointer bg-gradient-to-br ${bgColor} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100`}
                        >
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{activityName}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {pointsBadge}
                              {statusBadge}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-700 font-medium flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {displayDate}
                            </span>
                            {location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {location}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="mb-2">Chưa có hoạt động gần đây</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Top Students (1/3) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                  <Trophy className="w-5 h-5" />
                  Danh Sách Sinh Viên
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                  {topStudents?.length || 0} SV
                </span>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                {topStudents && topStudents.length > 0 ? (
                  topStudents.map((student, index) => {
                    // Xếp loại dựa trên điểm
                    const getScoreGrade = (points) => {
                      if (points >= 90) return { label: 'Xuất sắc', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700' };
                      if (points >= 80) return { label: 'Tốt', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' };
                      if (points >= 65) return { label: 'Khá', color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-700' };
                      if (points >= 50) return { label: 'Trung bình', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' };
                      return { label: 'Yếu', color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700' };
                    };
                    
                    const grade = getScoreGrade(student.points);
                    
                    return (
                      <div 
                        key={student.id}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">{student.mssv}</p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">{student.activitiesCount} hoạt động</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${grade.bg} ${grade.text}`}>
                              {grade.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className={`font-bold text-lg bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
                            {student.points}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">điểm RL</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Chưa có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activityId={selectedActivity}
        isOpen={showActivityModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}

