import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Trophy, Clock, QrCode, Star, TrendingUp,
  Award, Target, Zap, CheckCircle, Filter, Medal,
  Activity, BarChart3, Sparkles, ChevronRight
} from 'lucide-react';
import http from '../../services/http';
import useSemesterData from '../../hooks/useSemesterData';
import SemesterFilter from '../../components/SemesterFilter';

/**
 * DashboardStudentImproved - Neo-Brutalism Design
 * Trang dashboard sinh viên với thiết kế Neo-brutalism hiện đại
 * Features: Cards màu sắc, border đen đậm, shadow đặc trưng
 */
export default function DashboardStudentImproved() {
  const navigate = useNavigate();
  
  const [summary, setSummary] = React.useState({ 
    totalPoints: 0, 
    progress: 0, 
    targetPoints: 100, 
    activitiesJoined: 0,
    classRank: 1,
    totalStudents: 53,
    averagePoints: 27
  });
  const [upcoming, setUpcoming] = React.useState([]);
  const [criteriaProgress, setCriteriaProgress] = React.useState([]);
  const [userProfile, setUserProfile] = React.useState(null);
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
      
      const [dashboardRes, myActivitiesRes, profileRes] = await Promise.allSettled([
        http.get('/dashboard/student', { params }),
        http.get('/dashboard/activities/me', { params }),
        http.get('/users/profile').catch(() => http.get('/auth/profile'))
      ]);
      
      let apiData = {};
      let totalPoints = 0;
      
      if (dashboardRes.status === 'fulfilled') {
        apiData = dashboardRes.value.data.data || {};
        
        if (apiData.tong_quan) {
          totalPoints = Number(apiData.tong_quan.tong_diem || 0);
          const target = Number(apiData.tong_quan.muc_tieu || 100);
          const percent = target > 0 ? (totalPoints / target) * 100 : 0;
          const percentFixed = Math.round(Math.min(percent, 100));
          setSummary(prev => ({
            ...prev,
            totalPoints: Math.round(totalPoints),
            progress: percentFixed,
            targetPoints: target,
            activitiesJoined: apiData.tong_quan.tong_hoat_dong || 0
          }));
        }
        
        if (apiData.hoat_dong_sap_toi) {
          setUpcoming(apiData.hoat_dong_sap_toi);
        }
      }

      let myData = [];
      if (myActivitiesRes.status === 'fulfilled') {
        myData = myActivitiesRes.value.data?.success && Array.isArray(myActivitiesRes.value.data.data)
          ? myActivitiesRes.value.data.data
          : Array.isArray(myActivitiesRes.value.data)
            ? myActivitiesRes.value.data
            : [];
      }

      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data?.data || profileRes.value.data || {};
        setUserProfile(profileData);
      }

      // Calculate from activities
      try {
        const hkMatch = (registration) => {
          if (!semester) return true;
          const m = String(semester).match(/^(hoc_ky_1|hoc_ky_2)-(\d{4})$/);
          if (!m) return true;
          const hk = m[1];
          const y = parseInt(m[2], 10);
          const nh = hk === 'hoc_ky_1' ? `${y}-${y + 1}` : `${y - 1}-${y}`;
          const a = registration?.hoat_dong || registration?.activity || {};
          if (a.hoc_ky && a.nam_hoc) {
            return a.hoc_ky === hk && a.nam_hoc === nh;
          }
          return true;
        };
        const getStatus = (r) => (r?.registration_status || r?.trang_thai_dk || r?.status || r?.trang_thai || '').toLowerCase();
        const isAttended = (r) => {
          if (r?.is_attended === true || r?.attended === true) return true;
          const st = getStatus(r);
          return st === 'da_tham_gia';
        };
        const getPoints = (r) => Number(r?.diem_rl || r?.hoat_dong?.diem_rl || r?.activity?.diem_rl || r?.points || 0);
        const participated = (myData || []).filter(r => hkMatch(r) && (isAttended(r) || getPoints(r) > 0));
        const sumFromActivities = participated
          .filter(isAttended)
          .reduce((s, r) => s + getPoints(r), 0);
        if ((myData || []).length > 0) {
          totalPoints = sumFromActivities;
          const target = 100;
          const percentFixed = Math.round(Math.min((totalPoints / target) * 100, 100));
          setSummary(prev => ({
            ...prev,
            totalPoints: Math.round(totalPoints),
            progress: percentFixed,
            activitiesJoined: participated.length
          }));
        }
        
        // Calculate average
        if (participated.length > 0) {
          setSummary(prev => ({
            ...prev,
            averagePoints: Math.round(totalPoints / participated.length)
          }));
        }
      } catch (_) {}

      const criteriaProgress = apiData.tien_do_tieu_chi || [];
      setCriteriaProgress(criteriaProgress);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [semester, parseSemesterToLegacy]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 space-y-6">
      
      {/* Header with User Info */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 flex items-center gap-3">
          Xin chào, {userProfile?.ho_ten || userProfile?.name || 'Sinh viên'}! 🎉
        </h1>
        <p className="text-gray-600 text-lg">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>
      </div>

      {/* Semester Filter */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Học kỳ</h3>
        </div>
        <div className="max-w-xs">
          <SemesterFilter value={semester} onChange={setSemester} />
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
        <>
          {/* Neo-Brutalism Main Stats Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl transform translate-x-2 translate-y-2"></div>
            <div className="relative bg-white border-4 border-black rounded-3xl p-6 shadow-2xl">
              {/* Title Bar */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl mb-6 inline-flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                <Trophy className="w-5 h-5" />
                TỔNG ĐIỂM RÈN LUYỆN
              </div>

              {/* Large Score Display */}
              <div className="flex items-end gap-3 mb-4">
                <div className="text-7xl font-black text-gray-900">{summary.totalPoints}</div>
                <div className="text-3xl font-bold text-gray-400 pb-2">/ {summary.targetPoints}</div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-600">TIẾN ĐỘ</span>
                  <span className="text-2xl font-black text-pink-600">{summary.progress}%</span>
                </div>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-1000"
                    style={{ width: `${summary.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Stats Cards - Neo-Brutalism Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Card 1: Activities Joined */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl"></div>
              <div className="relative bg-yellow-400 border-4 border-black rounded-2xl p-6 transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="w-8 h-8 text-black" />
                  <div className="bg-black text-yellow-400 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wider">
                    THAM GIA
                  </div>
                </div>
                <div className="text-5xl font-black text-black mb-2">{summary.activitiesJoined}</div>
                <p className="text-sm font-bold text-black/70 uppercase tracking-wide">HOẠT ĐỘNG</p>
              </div>
            </div>

            {/* Card 2: Upcoming Activities */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl"></div>
              <div className="relative bg-pink-400 border-4 border-black rounded-2xl p-6 transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="w-8 h-8 text-black" />
                  <div className="bg-black text-pink-400 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wider">
                    SẮP TỚI
                  </div>
                </div>
                <div className="text-5xl font-black text-black mb-2">{upcoming.length}</div>
                <p className="text-sm font-bold text-black/70 uppercase tracking-wide">HOẠT ĐỘNG</p>
              </div>
            </div>

            {/* Card 3: Class Rank */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl"></div>
              <div className="relative bg-blue-400 border-4 border-black rounded-2xl p-6 transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="w-8 h-8 text-black" />
                  <div className="bg-black text-blue-400 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wider">
                    HẠNG LỚP
                  </div>
                </div>
                <div className="text-5xl font-black text-black mb-2">{summary.classRank}/{summary.totalStudents}</div>
                <p className="text-sm font-bold text-black/70 uppercase tracking-wide">XẾP HẠNG</p>
              </div>
            </div>

            {/* Card 4: Average Points */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl"></div>
              <div className="relative bg-green-400 border-4 border-black rounded-2xl p-6 transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <Star className="w-8 h-8 text-black" />
                  <div className="bg-black text-green-400 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wider">
                    MỤC TIÊU
                  </div>
                </div>
                <div className="text-5xl font-black text-black mb-2">{summary.averagePoints}</div>
                <p className="text-sm font-bold text-black/70 uppercase tracking-wide">ĐIỂM TRUNG BÌNH</p>
              </div>
            </div>
          </div>

          {/* Criteria Progress - Neo-Brutalism Style */}
          {criteriaProgress.length > 0 && (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl transform translate-x-2 translate-y-2"></div>
              <div className="relative bg-white border-4 border-black rounded-3xl p-6 shadow-2xl">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl mb-6 inline-flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                  <Target className="w-5 h-5" />
                  Tiến độ các tiêu chí
                </div>
                
                <div className="space-y-4">
                  {criteriaProgress.map(criteria => {
                    const percentage = criteria.diem_toi_da > 0 ? (criteria.diem_hien_tai / criteria.diem_toi_da * 100) : 0;
                    return (
                      <div key={criteria.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{criteria.icon || '📊'}</span>
                            <span className="font-black text-gray-700">{criteria.ten_tieu_chi}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border-2 border-black">
                            {criteria.diem_hien_tai} / {criteria.diem_toi_da}
                          </span>
                        </div>
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: criteria.mau_sac || '#3B82F6'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Activities List */}
          {upcoming.length > 0 && (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-3xl transform translate-x-2 translate-y-2"></div>
              <div className="relative bg-white border-4 border-black rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                    <Calendar className="w-5 h-5" />
                    Hoạt động sắp tới
                  </div>
                  <button
                    onClick={() => navigate('/student/activities')}
                    className="bg-black text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Xem tất cả →
                  </button>
                </div>
                
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map((activity, idx) => (
                    <div
                      key={idx}
                      className="group/item relative cursor-pointer"
                      onClick={() => navigate(`/activities/${activity.id}`)}
                    >
                      <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-xl"></div>
                      <div className="relative bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-black rounded-xl p-4 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-black text-gray-900 flex-1">{activity.ten_hd || activity.name}</h3>
                          <span className="bg-black text-yellow-400 px-3 py-1 rounded-lg text-xs font-black">
                            +{activity.diem_rl || 0}đ
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-700 font-bold">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/student/activities')}
              className="group relative"
            >
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-blue-500 border-4 border-black rounded-xl p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
                <Calendar className="w-10 h-10 text-white mb-3" />
                <div className="font-black text-white text-lg uppercase">Tham gia hoạt động</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/student/qr-scanner')}
              className="group relative"
            >
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-green-500 border-4 border-black rounded-xl p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
                <QrCode className="w-10 h-10 text-white mb-3" />
                <div className="font-black text-white text-lg uppercase">Quét QR điểm danh</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/student/scores')}
              className="group relative"
            >
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-purple-500 border-4 border-black rounded-xl p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
                <Award className="w-10 h-10 text-white mb-3" />
                <div className="font-black text-white text-lg uppercase">Xem điểm chi tiết</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
