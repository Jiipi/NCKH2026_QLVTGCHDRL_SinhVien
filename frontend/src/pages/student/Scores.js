import React from 'react';
import { TrendingUp, Calendar, Target, BookOpen, Users, Heart, Trophy, Medal, BarChart3, PieChart, RefreshCw, AlertCircle } from 'lucide-react';
import http from '../../services/http';
import SemesterFilter from '../../components/SemesterFilter';
import useSemesterData from '../../hooks/useSemesterData';

export default function Scores(){
  // Use useSemesterData hook to get semester options and current semester from API
  const { options: semesterOptions, currentSemester } = useSemesterData();
  
  // Track if user has manually selected a semester
  const [userSelectedSemester, setUserSelectedSemester] = React.useState(() => {
    try {
      return !!sessionStorage.getItem('current_semester');
    } catch (_) {
      return false;
    }
  });
  
  // Initialize semester from sessionStorage or currentSemester from API
  const [semester, setSemester] = React.useState(() => {
    try {
      const stored = sessionStorage.getItem('current_semester');
      if (stored) {
        return stored;
      }
      return '';
    } catch (_) {
      return '';
    }
  });
  
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Sync semester with currentSemester from API ONLY on initial load (if user hasn't selected one)
  React.useEffect(() => {
    if (currentSemester && !userSelectedSemester && !semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester, userSelectedSemester, semester]);

  // Handle semester change from user selection
  const handleSemesterChange = React.useCallback((newSemester) => {
    console.log('🔄 Semester changed from', semester, 'to', newSemester);
    if (newSemester !== semester) {
      setSemester(newSemester);
      setUserSelectedSemester(true); // Mark that user has manually selected
      setData(null); // Immediately clear old data
      try {
        sessionStorage.setItem('current_semester', newSemester);
      } catch (_) {}
    }
  }, [semester]);

  // Save semester to sessionStorage when it changes (but don't override user selection)
  React.useEffect(() => {
    if (semester && userSelectedSemester) {
      try {
        sessionStorage.setItem('current_semester', semester);
      } catch (_) {}
    }
  }, [semester, userSelectedSemester]);

  // Keep only unified semester value; backend supports `semester` directly

  const loadScores = React.useCallback(async function() {
    if (!semester) {
      console.log('⚠️ No semester selected, clearing data');
      setData(null); // Clear data if no semester selected
      return;
    }
    
    console.log('🔄 loadScores called for semester:', semester);
    setLoading(true);
    setError('');
    setData(null); // Clear old data when loading new semester to prevent showing stale data
    
    try {
      const params = { semester };
      
      console.log('📊 API Request - Loading scores for semester:', semester);
      console.log('📊 API Request params:', params);
      
      const response = await http.get('/v2/dashboard/scores/detailed', { params });
      
      console.log('✅ API Response received for semester:', semester);
      console.log('✅ Response data:', response.data);
      console.log('✅ Extracted data:', response.data.data);
      
      // Verify the data structure
      if (response.data && response.data.data) {
        const extractedData = response.data.data;
        console.log('✅ Summary for semester', semester, ':', extractedData.summary);
        // Backend returns Vietnamese field names: tong_diem, tong_hoat_dong, etc.
        console.log('✅ Total score:', extractedData.summary?.tong_diem);
        console.log('✅ Total activities:', extractedData.summary?.tong_hoat_dong);
        console.log('✅ Average points:', extractedData.summary?.average_points);
        // Backend returns my_rank_in_class, not rank
        console.log('✅ Rank in class:', extractedData.class_rankings?.my_rank_in_class);
        console.log('✅ Total in class:', extractedData.class_rankings?.total_students_in_class);
        console.log('✅ Activities count:', extractedData.activities?.length || 0);
        console.log('✅ First activity:', extractedData.activities?.[0]);
        console.log('✅ Last activity:', extractedData.activities?.[extractedData.activities?.length - 1]);
        
        // Check if data is actually different
        if (data) {
          const oldScore = data.summary?.tong_diem;
          const newScore = extractedData.summary?.tong_diem;
          if (oldScore === newScore) {
            console.warn('⚠️ WARNING: Data appears to be the same! Old score:', oldScore, 'New score:', newScore);
            console.warn('⚠️ This suggests the backend may not be filtering by semester correctly.');
          } else {
            console.log('✅ Data is different! Old score:', oldScore, 'New score:', newScore);
          }
        }
        
        setData(extractedData); // Extract data from API response wrapper
      } else {
        console.warn('⚠️ Unexpected response structure:', response.data);
        setData(response.data.data || response.data); // Try both structures
      }
    } catch (err) {
      console.error('❌ Error loading scores for semester:', semester);
      console.error('❌ Error object:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError(`Không thể tải dữ liệu điểm cho học kỳ ${semester}. Vui lòng thử lại.`);
      setData(null); // Clear data on error - don't show fallback data
    } finally {
      setLoading(false);
      console.log('✅ loadScores completed for semester:', semester);
    }
  }, [semester]);

  React.useEffect(function(){ 
    loadScores();
  }, [loadScores]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!data) return { categoryStats: [], totalActivities: 0, averagePoints: 0 };

    const activities = data.activities || [];
    const criteriaBreakdown = data.criteria_breakdown || [];
    
    // Map criteria to display categories
    const categoryStats = criteriaBreakdown.map(criteria => {
      let icon, color;
      if (criteria.key === 'hoc_tap') {
        icon = BookOpen; color = 'blue';
      } else if (criteria.key === 'tinh_nguyen') {
        icon = Heart; color = 'red';
      } else if (criteria.key === 'cong_dan') {
        icon = Users; color = 'purple';
      } else if (criteria.key === 'noi_quy') {
        icon = Trophy; color = 'green';
      } else {
        icon = Medal; color = 'yellow';
      }
      
      return {
        key: criteria.key,
        name: criteria.name,
        icon,
        color,
        points: criteria.current,
        max: criteria.max,
        percentage: criteria.percentage
      };
    });

    return {
      categoryStats,
      // Backend returns Vietnamese keys
      totalActivities: data.summary?.tong_hoat_dong || 0,
      averagePoints: data.summary?.tong_hoat_dong > 0 
        ? (data.summary?.tong_diem / data.summary?.tong_hoat_dong) 
        : 0
    };
  }, [data]);

  function ScoreCard({ activity }) {
    // Parse date from activity
    const date = activity.ngay_bd ? new Date(activity.ngay_bd) : new Date();
    const formattedDate = date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: 'numeric', 
      year: 'numeric' 
    });
    
    // Get activity type/category - check multiple possible fields
    const activityType = activity.loai 
      || activity.loai_hd?.ten_loai_hd 
      || activity.ten_loai 
      || activity.category 
      || 'Hoạt động';
    
    // Get activity name
    const activityName = activity.ten_hd || activity.name || 'Hoạt động';
    
    // Get points - check multiple possible fields
    const points = activity.diem 
      || activity.diem_rl 
      || activity.points 
      || 0;
    
    // Get status - check multiple possible fields
    const status = activity.trang_thai 
      || activity.trang_thai_dk 
      || activity.status 
      || 'da_tham_gia';
    
    // Determine status text
    const statusText = status === 'da_tham_gia' || status === 'da_dien_ra' || status === 'participated' 
      ? 'Đã tham gia' 
      : status === 'da_duyet' || status === 'approved'
      ? 'Đã duyệt'
      : status === 'cho_duyet' || status === 'pending'
      ? 'Chờ duyệt'
      : 'Đã tham gia';

    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon and Activity Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Trophy Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            {/* Activity Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                {activityName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="truncate">{activityType}</span>
                <span className="text-gray-400">•</span>
                <span className="flex-shrink-0">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {/* Right: Points and Status */}
          <div className="flex-shrink-0 text-right">
            <div className="text-lg font-bold text-gray-900 mb-1">
              +{points} điểm
            </div>
            <div className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {statusText}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ProgressCircle({ percentage, size = 120, strokeWidth = 8 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${percentage * circumference / 100} ${circumference}`;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="#e5e7eb"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="#3b82f6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-xs text-gray-500">mục tiêu</span>
        </div>
      </div>
    );
  }

  // Calculate values from data - these will update when semester changes
  // MUST be called before any early returns to follow React Hooks rules
  const targetScore = 100;
  // Backend returns Vietnamese keys: tong_diem instead of total_score
  const currentScore = data?.summary?.tong_diem || 0;
  const progressPercentage = React.useMemo(() => {
    if (!data || !data.summary) return 0;
    return Math.min((currentScore / targetScore) * 100, 100);
  }, [data, currentScore, targetScore]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Điểm rèn luyện</h1>
              <p className="text-orange-100">Theo dõi và phân tích kết quả rèn luyện của bạn</p>
            </div>
            <div className="min-w-[240px]">
              <SemesterFilter value={semester} onChange={handleSemesterChange} label="" />
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
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
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500"></div>
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
            
            {/* Top Bar with Badge and Action */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-yellow-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-yellow-400">
                    ⚡ ĐIỂM RÈN LUYỆN
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
              {/* Semester Filter - góc phải */}
              <div className="bg-white/10 border-2 border-white/30 rounded-xl p-3 backdrop-blur-sm min-w-[200px]">
                <SemesterFilter value={semester} onChange={handleSemesterChange} label="" />
              </div>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Đ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">I</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ể</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">M</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">R</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">È</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                    LUYỆN
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Theo dõi, quản lý và phân tích kết quả rèn luyện của bạn một cách chi tiết
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Tổng điểm - VÀNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Trophy className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{currentScore}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG ĐIỂM</p>
                </div>
              </div>

              {/* Card 2: Xếp hạng - XANH LÁ */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Medal className="h-6 w-6 text-black mb-2" />
                  {/* Backend returns my_rank_in_class in class_rankings object */}
                  <p className="text-3xl font-black text-black">
                    {data?.class_rankings?.my_rank_in_class ? `#${data.class_rankings.my_rank_in_class}` : '-'}
                  </p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">XẾP HẠNG</p>
                </div>
              </div>

              {/* Card 3: Hoạt động - XANH DƯƠNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Calendar className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.totalActivities}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 4: Trung bình - ĐỎ/HỒNG */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-pink-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <TrendingUp className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.averagePoints.toFixed(1)}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TRUNG BÌNH</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
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
        `}</style>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">{error}</span>
          </div>
        </div>
      )}

      {/* Filter moved to header above */}

      {/* Summary Stats */}
      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tổng điểm học kỳ</h3>
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex items-center justify-center mb-4">
                <ProgressCircle percentage={Math.round(progressPercentage)} />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {currentScore}/{targetScore}
                </div>
                <p className="text-gray-600 mb-2">điểm rèn luyện</p>
                {data.summary?.xep_loai && (
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      data.summary.xep_loai === 'Xuất sắc' ? 'bg-yellow-100 text-yellow-800' :
                      data.summary.xep_loai === 'Tốt' ? 'bg-blue-100 text-blue-800' :
                      data.summary.xep_loai === 'Khá' ? 'bg-green-100 text-green-800' :
                      data.summary.xep_loai === 'Trung bình' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.summary.xep_loai}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Thống kê nhanh</h3>
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hoạt động tham gia</span>
                  <span className="font-semibold text-gray-900">{stats.totalActivities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm trung bình</span>
                  <span className="font-semibold text-gray-900">{stats.averagePoints.toFixed(1)}</span>
                </div>
                {/* Backend returns my_rank_in_class and total_students_in_class */}
                {data.class_rankings?.my_rank_in_class && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Xếp hạng lớp</span>
                    <span className="font-semibold text-gray-900">
                      {data.class_rankings.my_rank_in_class}/{data.class_rankings.total_students_in_class || 1}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-indigo-600" />
                Lịch sử hoạt động
              </h3>
              {data.activities?.length > 0 && (
                <span className="text-sm text-gray-500">
                  {data.activities.length} hoạt động
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {data.activities?.length > 0 ? (
                data.activities.map((activity, index) => (
                  <ScoreCard key={activity.id || index} activity={activity} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 font-medium">Chưa có hoạt động nào trong kỳ này</p>
                  <p className="text-sm text-gray-400 mt-2">Các hoạt động bạn đã tham gia sẽ hiển thị ở đây</p>
                </div>
              )}
            </div>
            
            {/* Custom Scrollbar Styles */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
          </div>

          {/* Class Rankings */}
          {data.class_rankings && data.class_rankings.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bảng xếp hạng lớp</h3>
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hạng</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">MSSV</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Họ tên</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Số HĐ</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tổng điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.class_rankings.map((student, index) => (
                      <tr 
                        key={student.mssv} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          student.is_current_user ? 'bg-blue-50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mr-2" />}
                            {index === 1 && <Medal className="h-5 w-5 text-gray-400 mr-2" />}
                            {index === 2 && <Medal className="h-5 w-5 text-orange-400 mr-2" />}
                            <span className={student.is_current_user ? 'text-blue-700' : 'text-gray-900'}>
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={student.is_current_user ? 'text-blue-700' : 'text-gray-600'}>
                            {student.mssv}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={student.is_current_user ? 'text-blue-900' : 'text-gray-900'}>
                            {student.ho_ten}
                            {student.is_current_user && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                Bạn
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={student.is_current_user ? 'text-blue-700' : 'text-gray-600'}>
                            {student.so_hoat_dong}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${
                            student.is_current_user ? 'text-blue-700' : 
                            student.tong_diem >= 90 ? 'text-yellow-600' :
                            student.tong_diem >= 80 ? 'text-blue-600' :
                            student.tong_diem >= 65 ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {student.tong_diem} điểm
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <strong>Ghi chú:</strong> Bảng xếp hạng dựa trên tổng điểm rèn luyện của học kỳ này trong lớp.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}