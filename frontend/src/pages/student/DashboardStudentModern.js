import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Trophy, Clock, QrCode, Star, TrendingUp,
  Award, Target, Zap, CheckCircle, Filter, Medal,
  Activity, BarChart3, Sparkles, ChevronRight, X, MapPin, Users
} from 'lucide-react';
import http from '../../services/http';
import useSemesterData from '../../hooks/useSemesterData';
import SemesterFilter from '../../components/SemesterFilter';

export default function DashboardStudentModern() {
  const navigate = useNavigate();
  
  const [summary, setSummary] = React.useState({ 
    totalPoints: 0, 
    progress: 0, 
    targetPoints: 100, 
    activitiesJoined: 0,
    activitiesUpcoming: 0,
    classRank: 1,
    totalStudents: 53,
    goalText: 'Cần 27 điểm để đạt điểm trung bình',
    goalPoints: 27
  });
  const [upcoming, setUpcoming] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [myActivitiesData, setMyActivitiesData] = React.useState({ 
    all: [], 
    pending: [], 
    approved: [], 
    joined: [], 
    rejected: [] 
  });
  const [recentFilter, setRecentFilter] = React.useState('all'); // 'all', 'pending', 'approved', 'joined', 'rejected'
  const [selectedActivity, setSelectedActivity] = React.useState(null);
  const [showSummaryModal, setShowSummaryModal] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  const [studentInfo, setStudentInfo] = React.useState({ mssv: '', ten_lop: '' });
  const [loading, setLoading] = React.useState(true);
  const [semester, setSemester] = React.useState(() => {
    try { return sessionStorage.getItem('current_semester') || ''; } catch (_) { return ''; }
  });
  const { options: semesterOptions, currentSemester } = useSemesterData();

  React.useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester]);

  React.useEffect(() => {
    if (semester) {
      try { sessionStorage.setItem('current_semester', semester); } catch (_) {}
    }
  }, [semester]);

  const parseSemesterToLegacy = React.useCallback((value) => {
    const m = String(value || '').match(/^(hoc_ky_1|hoc_ky_2)-(\d{4})$/);
    if (!m) return { hoc_ky: '', nam_hoc: '' };
    const hoc_ky = m[1];
    const y = parseInt(m[2], 10);
    const nam_hoc = hoc_ky === 'hoc_ky_1' ? `${y}-${y + 1}` : `${y - 1}-${y}`;
    return { hoc_ky, nam_hoc };
  }, []);

  // Calculate goal text and points needed
  const calculateGoal = React.useCallback((totalPoints) => {
    const points = Math.round(totalPoints);
    if (points < 50) {
      const needed = 50 - points;
      return {
        goalText: `Cần ${needed} điểm để đạt trung bình`,
        goalPoints: needed
      };
    } else if (points >= 50 && points < 70) {
      const needed = 70 - points;
      return {
        goalText: `Cần ${needed} điểm để đạt khá`,
        goalPoints: needed
      };
    } else if (points >= 70 && points < 80) {
      const needed = 80 - points;
      return {
        goalText: `Cần ${needed} điểm để đạt giỏi`,
        goalPoints: needed
      };
    } else if (points >= 80 && points < 100) {
      const needed = 100 - points;
      return {
        goalText: `Cần ${needed} điểm để đạt xuất sắc`,
        goalPoints: needed
      };
    } else {
      return {
        goalText: 'Đã đạt xuất sắc!',
        goalPoints: 0
      };
    }
  }, []);

  // Get classification
  const getClassification = React.useCallback((points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  }, []);

  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const legacy = parseSemesterToLegacy(semester);
      const params = {};
      if (semester) {
        params.semester = semester;
        if (legacy.hoc_ky) params.hoc_ky = legacy.hoc_ky;
        if (legacy.nam_hoc) params.nam_hoc = legacy.nam_hoc;
      }
      
      const [dashboardRes, myActivitiesRes, profileRes, scoresRes] = await Promise.allSettled([
        http.get('/dashboard/student', { params }),
        http.get('/dashboard/activities/me', { params }),
        http.get('/users/profile').catch(() => http.get('/auth/profile')),
        http.get('/scores', { params }).catch(() => Promise.resolve({ data: { data: {} } }))
      ]);
      
      let apiData = {};
      let totalPoints = 0;
      let activitiesJoined = 0;
      let activitiesUpcoming = 0;
      let classRank = 1;
      let totalStudents = 53;

      // ✅ SỬ DỤNG DỮ LIỆU TỪ API - Backend đã tính đúng theo lớp và học kỳ
      if (dashboardRes.status === 'fulfilled') {
        apiData = dashboardRes.value.data.data || {};
        
        // Lấy thông tin sinh viên từ API
        if (apiData.sinh_vien) {
          setStudentInfo({
            mssv: apiData.sinh_vien.mssv || '',
            ten_lop: apiData.sinh_vien.lop?.ten_lop || ''
          });
        }
        
        // Lấy tổng điểm từ API (đã được tính đúng theo lớp và học kỳ)
        if (apiData.tong_quan) {
          totalPoints = Number(apiData.tong_quan.tong_diem || 0);
          activitiesJoined = apiData.tong_quan.tong_hoat_dong || 0;
          
          const target = Number(apiData.tong_quan.muc_tieu || 100);
          const percentFixed = Math.round(Math.min((totalPoints / target) * 100, 100) * 10) / 10;
          
          // Calculate goal
          const goal = calculateGoal(totalPoints);
          
          setSummary(prev => ({
            ...prev,
            totalPoints: Math.round(totalPoints * 10) / 10,
            progress: percentFixed,
            targetPoints: target,
            activitiesJoined: activitiesJoined,
            goalText: goal.goalText,
            goalPoints: goal.goalPoints
          }));
        }
        
        if (apiData.hoat_dong_sap_toi) {
          setUpcoming(apiData.hoat_dong_sap_toi);
          activitiesUpcoming = apiData.hoat_dong_sap_toi.length;
          setSummary(prev => ({ ...prev, activitiesUpcoming }));
        }
        
        // Không dùng apiData.hoat_dong_gan_day nữa, sẽ lấy từ MyActivities
        
        // Lấy hạng lớp từ API response
        if (apiData.so_sanh_lop) {
          classRank = apiData.so_sanh_lop.my_rank_in_class || 1;
          totalStudents = apiData.so_sanh_lop.total_students_in_class || 53;
          setSummary(prev => ({
            ...prev,
            classRank,
            totalStudents
          }));
        }
      }

      // Fallback: Get class ranking from scores API if not in dashboard response
      if (classRank === 1 && scoresRes.status === 'fulfilled') {
        const scoresData = scoresRes.value.data?.data || scoresRes.value.data || {};
        if (scoresData.summary) {
          const fallbackRank = scoresData.summary.rank_in_class || 1;
          const fallbackTotal = scoresData.summary.total_students_in_class || 53;
          if (fallbackRank !== 1 || fallbackTotal !== 53) {
            setSummary(prev => ({
              ...prev,
              classRank: fallbackRank,
              totalStudents: fallbackTotal
            }));
          }
        }
      }

      // ✅ Lấy dữ liệu từ MyActivities và lọc theo status
      if (myActivitiesRes.status === 'fulfilled') {
        const myData = myActivitiesRes.value.data?.success && Array.isArray(myActivitiesRes.value.data.data)
          ? myActivitiesRes.value.data.data
          : Array.isArray(myActivitiesRes.value.data)
            ? myActivitiesRes.value.data
            : [];
        
        // Lọc theo status
        const pending = myData.filter(x => {
          const status = (x.trang_thai_dk || x.status || '').toLowerCase();
          return status === 'cho_duyet' || status === 'pending';
        });
        const approved = myData.filter(x => {
          const status = (x.trang_thai_dk || x.status || '').toLowerCase();
          return status === 'da_duyet' || status === 'approved';
        });
        const joined = myData.filter(x => {
          const status = (x.trang_thai_dk || x.status || '').toLowerCase();
          return status === 'da_tham_gia' || status === 'participated' || status === 'attended';
        });
        const rejected = myData.filter(x => {
          const status = (x.trang_thai_dk || x.status || '').toLowerCase();
          return status === 'tu_choi' || status === 'rejected';
        });
        
        setMyActivitiesData({
          all: myData,
          pending,
          approved,
          joined,
          rejected
        });
      }

      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data?.data || profileRes.value.data || {};
        setUserProfile(profileData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [semester, parseSemesterToLegacy, calculateGoal]);

  // Update recent activities khi filter thay đổi
  React.useEffect(() => {
    let filtered = [];
    switch (recentFilter) {
      case 'pending':
        filtered = myActivitiesData.pending;
        break;
      case 'approved':
        filtered = myActivitiesData.approved;
        break;
      case 'joined':
        filtered = myActivitiesData.joined;
        break;
      case 'rejected':
        filtered = myActivitiesData.rejected;
        break;
      default:
        filtered = myActivitiesData.all;
    }
    setRecentActivities(filtered);
  }, [recentFilter, myActivitiesData]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const classification = getClassification(summary.totalPoints);
  const formatNumber = (n) => {
    const num = Number(n || 0);
    return (Math.round(num * 10) / 10).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      
      {/* Header + Cards Layout - Cards đẩy lên cùng hàng với Xin chào */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* BÊN TRÁI: Header + Bộ lọc học kỳ (thu gọn) */}
          <div className="space-y-4">
            {/* Compact Header */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                {/* Avatar với Progress Ring theo tổng điểm */}
                <div className="relative">
                  {/* SVG Progress Circle - vòng tròn ngoài cùng */}
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
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - summary.progress / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Avatar - hiển thị ảnh hoặc chữ cái */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
                    {userProfile?.anh_dai_dien || userProfile?.avatar ? (
                      <img 
                        src={userProfile?.anh_dai_dien || userProfile?.avatar} 
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl font-black text-white ${(userProfile?.anh_dai_dien || userProfile?.avatar) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                      {(userProfile?.ho_ten || userProfile?.name || 'DV').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
                    Xin chào, {(userProfile?.ho_ten || userProfile?.name || 'Sinh viên')}! 
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                  </h1>
                  <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>
                  
                  {/* Badges - Xếp loại, MSSV, Lớp - ngay dưới phần chào */}
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
            
            {/* BỘ LỌC HỌC KỲ - Thu gọn */}
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
                    <SemesterFilter value={semester} onChange={setSemester} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BÊN PHẢI: 5 Cards - Đẩy lên đầu, cùng hàng với Xin chào */}
          {!loading && (
            <div className="space-y-4">
              
              {/* Card TỔNG ĐIỂM RÈN LUYỆN - ở trên, rộng */}
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
                        <div
                          className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(summary.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-white font-black text-lg ml-2">
                      <span className="text-[10px] font-bold text-white/80">TIẾN ĐỘ </span>
                      {formatNumber(summary.progress)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Cards nhỏ - Grid 2x2 */}
              <div className="grid grid-cols-2 gap-3">
              
              {/* Card 1: Activities Joined - VÀNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-5 h-5 text-black" />
                    <div className="bg-black text-yellow-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      THAM GIA
                    </div>
                  </div>
                  <p className="text-3xl font-black text-black mb-0.5">{summary.activitiesJoined}</p>
                  <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 2: Upcoming - HỒNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-pink-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-black" />
                    <div className="bg-black text-pink-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      SẮP TỚI
                    </div>
                  </div>
                  <p className="text-3xl font-black text-black mb-0.5">{summary.activitiesUpcoming}</p>
                  <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 3: Class Rank - XANH DƯƠNG */}
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

              {/* Card 4: Goal - XANH LÁ */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-black" />
                    <div className="bg-black text-green-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                      MỤC TIÊU
                    </div>
                  </div>
                  {summary.goalPoints > 0 ? (
                    <>
                      <p className="text-2xl font-black text-black mb-0.5">{summary.goalPoints}</p>
                      <p className="text-[9px] font-black text-black/80 uppercase tracking-wide leading-tight line-clamp-2">
                        {summary.goalText}
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
              {/* End 4 cards grid */}

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
          {/* Hoạt động sắp tới + Hoạt động gần đây - Grid 2 cột */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upcoming Activities - Hoạt động sắp tới */}
            {upcoming.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                    <Calendar className="w-5 h-5" />
                    Hoạt động sắp tới
                  </div>
                  <button
                    onClick={() => navigate('/student/activities')}
                    className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                  >
                    Xem tất cả →
                  </button>
                </div>
                
                {/* Scrollable list */}
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                  {upcoming.map((activity, idx) => {
                    const activityData = activity.activity || activity;
                    const daysUntil = activity.ngay_bd 
                      ? Math.ceil((new Date(activity.ngay_bd) - new Date()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <div
                        key={activity.id || idx}
                        className="group/item cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowSummaryModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">
                            {activityData.ten_hd || activityData.name || 'Hoạt động'}
                          </h3>
                          <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold ml-2 whitespace-nowrap">
                            {daysUntil !== null ? `+${daysUntil}d` : `+${formatNumber(activityData.diem_rl || 0)}đ`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                          {(activity.dia_diem || activityData.dia_diem) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {activity.dia_diem || activityData.dia_diem}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activities - Hoạt động gần đây */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                  <Activity className="w-5 h-5" />
                  Hoạt động gần đây
                </div>
                <button
                  onClick={() => navigate('/student/my-activities')}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Xem tất cả →
                </button>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setRecentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    recentFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Tất cả ({myActivitiesData.all.length})
                </button>
                <button
                  onClick={() => setRecentFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    recentFilter === 'pending'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Chờ duyệt ({myActivitiesData.pending.length})
                </button>
                <button
                  onClick={() => setRecentFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    recentFilter === 'approved'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Đã duyệt ({myActivitiesData.approved.length})
                </button>
                <button
                  onClick={() => setRecentFilter('joined')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    recentFilter === 'joined'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Đã tham gia ({myActivitiesData.joined.length})
                </button>
                <button
                  onClick={() => setRecentFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    recentFilter === 'rejected'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Bị từ chối ({myActivitiesData.rejected.length})
                </button>
              </div>
              
              {/* Scrollable list */}
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => {
                    const activityData = activity.activity || activity;
                    const status = (activity.trang_thai_dk || activity.status || '').toLowerCase();
                    const isPending = status === 'cho_duyet' || status === 'pending';
                    const isApproved = status === 'da_duyet' || status === 'approved';
                    const isJoined = status === 'da_tham_gia' || status === 'participated' || status === 'attended';
                    const isRejected = status === 'tu_choi' || status === 'rejected';
                    
                    // Background color based on status
                    let bgColor = 'bg-blue-50';
                    if (isPending) bgColor = 'bg-yellow-50';
                    else if (isApproved) bgColor = 'bg-green-50';
                    else if (isJoined) bgColor = 'bg-blue-50';
                    else if (isRejected) bgColor = 'bg-red-50';
                    
                    // Status badge với design mềm mại
                    let statusBadge = null;
                    let pointsBadge = null;
                    if (isPending) {
                      statusBadge = (
                        <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Chờ duyệt
                        </span>
                      );
                      pointsBadge = (
                        <span className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                          +{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}d
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
                          +{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}d
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
                          +{formatNumber(activityData.diem_rl || activity.diem_rl || 0)}d
                        </span>
                      );
                    }
                    
                    // Lấy địa điểm từ nhiều nguồn có thể
                    const location = activity.dia_diem 
                      || activityData.dia_diem 
                      || activity.activity?.dia_diem 
                      || activity.hoat_dong?.dia_diem
                      || activityData.location
                      || activity.location
                      || 'N/A';
                    
                    // Lấy ngày từ nhiều nguồn có thể
                    const displayDate = activity.ngay_tham_gia 
                      ? new Date(activity.ngay_tham_gia).toLocaleDateString('vi-VN')
                      : activity.ngay_bd
                      ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN')
                      : activityData.ngay_bd
                      ? new Date(activityData.ngay_bd).toLocaleDateString('vi-VN')
                      : activityData.ngay_tham_gia
                      ? new Date(activityData.ngay_tham_gia).toLocaleDateString('vi-VN')
                      : activity.hoat_dong?.ngay_bd
                      ? new Date(activity.hoat_dong.ngay_bd).toLocaleDateString('vi-VN')
                      : 'N/A';
                    
                    return (
                      <div
                        key={activity.id || activity.activity_id || idx}
                        className="group/item cursor-pointer bg-gradient-to-br rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          background: isPending 
                            ? 'linear-gradient(to bottom right, #fef9c3, #fef3c7)'
                            : isApproved
                            ? 'linear-gradient(to bottom right, #dcfce7, #d1fae5)'
                            : isJoined
                            ? 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)'
                            : isRejected
                            ? 'linear-gradient(to bottom right, #fee2e2, #fecaca)'
                            : 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)'
                        }}
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowSummaryModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 flex-1 text-sm leading-tight">
                            {activityData.ten_hd || activityData.name || 'Hoạt động'}
                          </h3>
                          <div className="ml-2 flex items-center gap-2">
                            {statusBadge}
                            {pointsBadge}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-700 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {displayDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {location}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 font-medium">
                    Không có hoạt động nào
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowSummaryModal(false);
          setSelectedActivity(null);
        }}>
          <div className="bg-white border-4 border-black rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900">Tóm tắt hoạt động</h2>
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    setSelectedActivity(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>
              
              <div className="space-y-4">
                {(() => {
                  // Lấy dữ liệu từ nhiều nguồn có thể (giống như trong list)
                  const activityData = selectedActivity.activity || selectedActivity.hoat_dong || selectedActivity;
                  const act = activityData || selectedActivity;
                  
                  // Lấy tên hoạt động từ nhiều nguồn
                  const activityName = act.ten_hd || act.name || activityData?.ten_hd || activityData?.name || selectedActivity.ten_hd || selectedActivity.name || 'Hoạt động';
                  
                  // Lấy mô tả từ nhiều nguồn
                  const description = act.mo_ta || act.description || activityData?.mo_ta || activityData?.description || selectedActivity.mo_ta || selectedActivity.description || 'Không có mô tả';
                  
                  // Lấy ngày bắt đầu từ nhiều nguồn
                  const startDate = act.ngay_bd || activityData?.ngay_bd || selectedActivity.ngay_bd || selectedActivity.hoat_dong?.ngay_bd;
                  
                  // Lấy ngày kết thúc từ nhiều nguồn
                  const endDate = act.ngay_kt || activityData?.ngay_kt || selectedActivity.ngay_kt || selectedActivity.hoat_dong?.ngay_kt;
                  
                  // Lấy địa điểm từ nhiều nguồn
                  const location = act.dia_diem || activityData?.dia_diem || selectedActivity.dia_diem || selectedActivity.hoat_dong?.dia_diem || selectedActivity.location;
                  
                  // Lấy điểm rèn luyện từ nhiều nguồn
                  const points = act.diem_rl || activityData?.diem_rl || selectedActivity.diem_rl || selectedActivity.hoat_dong?.diem_rl || act.diem || activityData?.diem || 0;
                  
                  // Lấy trạng thái
                  const status = (selectedActivity.trang_thai_dk || selectedActivity.status || '').toLowerCase();
                  
                  return (
                    <>
                      <div>
                        <h3 className="font-black text-gray-900 mb-2">{activityName}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                            <p className="text-sm font-bold text-gray-900">
                              {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500">Ngày kết thúc</p>
                            <p className="text-sm font-bold text-gray-900">
                              {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-500">Địa điểm</p>
                              <p className="text-sm font-bold text-gray-900">
                                {location}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500">Điểm rèn luyện</p>
                            <p className="text-sm font-bold text-gray-900">
                              {formatNumber(points)} điểm
                            </p>
                          </div>
                        </div>
                        
                        {status && (
                          <div className="flex items-center gap-2 col-span-2">
                            <CheckCircle className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-500">Trạng thái</p>
                              <p className="text-sm font-bold text-gray-900">
                                {status === 'cho_duyet' || status === 'pending' ? 'Chờ duyệt'
                                  : status === 'da_duyet' || status === 'approved' ? 'Đã duyệt'
                                  : status === 'da_tham_gia' || status === 'participated' ? 'Đã tham gia'
                                  : status === 'tu_choi' || status === 'rejected' ? 'Bị từ chối'
                                  : status}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    setSelectedActivity(null);
                  }}
                  className="bg-black text-white px-6 py-2 rounded-lg font-black text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
