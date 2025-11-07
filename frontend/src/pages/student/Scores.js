import React from 'react';
import { TrendingUp, Calendar, Target, BookOpen, Users, Heart, Trophy, Medal, BarChart3, PieChart, RefreshCw, AlertCircle } from 'lucide-react';
import http from '../../services/http';
import SemesterFilter from '../../components/SemesterFilter';

export default function Scores(){
  // Unified semester value like: hoc_ky_1-2025 | hoc_ky_2-2025
  const getDefaultSemester = () => {
    const y = new Date().getFullYear();
    const m = new Date().getMonth() + 1;
    if (m >= 7 && m <= 11) return `hoc_ky_1-${y}`;
    if (m === 12) return `hoc_ky_2-${y}`;
    if (m >= 1 && m <= 4) return `hoc_ky_2-${y - 1}`;
    return `hoc_ky_1-${y}`;
  };
  const [semester, setSemester] = React.useState(getDefaultSemester());
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Keep only unified semester value; backend supports `semester` directly

  const loadScores = React.useCallback(async function() {
    if (!semester) return;
    
    setLoading(true);
    setError('');
    
    try {
      const params = { semester };
      
      const response = await http.get('/dashboard/scores/detailed', { params });
      
      setData(response.data.data); // Extract data from API response wrapper
    } catch (err) {
      console.error('❌ Error loading scores:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Không thể tải dữ liệu điểm. Đang hiển thị dữ liệu mẫu.');
      // Fallback to sample data
      setData({
        student_info: {
          ho_ten: "Nguyễn Văn A",
          mssv: "2021001234", 
          lop: "CNTT01"
        },
        summary: {
          total_score: 85,
          total_activities: 12,
          average_points: 7.1,
          rank_in_class: 5,
          total_students_in_class: 45
        },
        criteria_breakdown: [
          { key: 'hoc_tap', name: 'Ý thức và kết quả học tập', current: 20, max: 25, percentage: 80 },
          { key: 'noi_quy', name: 'Ý thức chấp hành nội quy', current: 25, max: 25, percentage: 100 },
          { key: 'tinh_nguyen', name: 'Hoạt động phong trào', current: 15, max: 20, percentage: 75 },
          { key: 'cong_dan', name: 'Quan hệ với cộng đồng', current: 20, max: 25, percentage: 80 },
          { key: 'khen_thuong', name: 'Thành tích đặc biệt', current: 5, max: 5, percentage: 100 }
        ],
        activities: [
          {
            id: 1,
            ten_hd: "Hội thảo công nghệ AI",
            loai: "Học tập và nghiên cứu khoa học",
            diem: 8,
            ngay_bd: "2024-01-15",
            trang_thai: "da_dien_ra"
          },
          {
            id: 2,
            ten_hd: "Hiến máu nhân đạo",
            loai: "Tình nguyện và từ thiện",
            diem: 5,
            ngay_bd: "2024-02-20",
            trang_thai: "da_dien_ra"
          }
        ]
      });
    } finally {
      setLoading(false);
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
      totalActivities: data.summary?.total_activities || 0,
      averagePoints: data.summary?.average_points || 0
    };
  }, [data]);

  function ScoreCard({ activity }) {
    const date = activity.ngay_bd ? new Date(activity.ngay_bd) : new Date();
    
    // Determine category based on activity type
    let categoryConfig;
    const loai = (activity.loai || '').toLowerCase();
    
    if (loai.includes('học') || loai.includes('giáo dục')) {
      categoryConfig = { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: BookOpen, color: 'blue' };
    } else if (loai.includes('tình nguyện') || loai.includes('phong trào')) {
      categoryConfig = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: Heart, color: 'red' };
    } else if (loai.includes('văn hóa') || loai.includes('thể thao')) {
      categoryConfig = { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: Users, color: 'purple' };
    } else {
      categoryConfig = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: Trophy, color: 'green' };
    }

    const CategoryIcon = categoryConfig.icon;

    // Create safe CSS classes to avoid dynamic Tailwind issues
    const iconBgClass = categoryConfig.color === 'blue' ? 'bg-blue-100' :
                       categoryConfig.color === 'red' ? 'bg-red-100' :
                       categoryConfig.color === 'purple' ? 'bg-purple-100' : 'bg-green-100';
    
    const tagBgClass = categoryConfig.color === 'blue' ? 'bg-blue-100' :
                      categoryConfig.color === 'red' ? 'bg-red-100' :
                      categoryConfig.color === 'purple' ? 'bg-purple-100' : 'bg-green-100';

    return (
      <div className={`${categoryConfig.bg} ${categoryConfig.border} border rounded-lg p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${iconBgClass} rounded-lg`}>
              <CategoryIcon className={`h-6 w-6 ${categoryConfig.text}`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{activity.ten_hd}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${tagBgClass} ${categoryConfig.text}`}>
                  {activity.loai || 'Khác'}
                </span>
                <span className="text-sm text-gray-500">{date.toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              +{activity.diem || 0} điểm
            </div>
            <div className="text-sm text-gray-500">
              {activity.trang_thai === 'da_dien_ra' ? 'Đã tham gia' : 'Đã đăng ký'}
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
              <SemesterFilter value={semester} onChange={setSemester} label="" />
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const targetScore = 100;
  const currentScore = data?.summary?.total_score || 0;
  const progressPercentage = Math.min((currentScore / targetScore) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header - Neo-brutalism Style giống "HOẠT ĐỘNG CỦA TÔI" */}
      <div className="group relative">
        <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-3xl"></div>
        <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 border-4 border-black rounded-3xl p-6 lg:p-8">
          
          {/* Tab buttons và count */}
          <div className="flex items-center gap-4 mb-6">
            <button className="px-6 py-2.5 bg-black text-yellow-400 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-black hover:bg-gray-900 transition-colors flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              ĐIỂM CỦA TÔI
            </button>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl">
              <span className="text-white font-black text-sm">{stats.totalActivities} HOẠT ĐỘNG</span>
            </div>
          </div>

          {/* Title and Description */}
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight mb-3 flex items-center gap-3">
              ĐIỂM RÈN LUYỆN
            </h1>
            <p className="text-white/90 font-bold text-lg">
              Theo dõi, quản lý và chỉnh phục các hoạt động rèn luyện bạn đã đăng ký
            </p>
          </div>

          {/* Stats Cards Row - 4 cards màu sắc */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổng điểm - VÀNG */}
            <div className="group/card relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-2xl"></div>
              <div className="relative bg-yellow-400 border-4 border-black rounded-2xl p-5 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                <Trophy className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{currentScore}</p>
                <p className="text-xs font-black text-black/80 uppercase tracking-wider">Tổng điểm</p>
              </div>
            </div>

            {/* Card 2: Xếp hạng - XANH LÁ */}
            <div className="group/card relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-2xl"></div>
              <div className="relative bg-green-400 border-4 border-black rounded-2xl p-5 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                <Medal className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{data?.summary?.rank_in_class ? `#${data.summary.rank_in_class}` : '-'}</p>
                <p className="text-xs font-black text-black/80 uppercase tracking-wider">Xếp hạng</p>
              </div>
            </div>

            {/* Card 3: Hoạt động - XANH DƯƠNG */}
            <div className="group/card relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-2xl"></div>
              <div className="relative bg-blue-400 border-4 border-black rounded-2xl p-5 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                <Calendar className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{stats.totalActivities}</p>
                <p className="text-xs font-black text-black/80 uppercase tracking-wider">Hoạt động</p>
              </div>
            </div>

            {/* Card 4: Trung bình - ĐỎ/HỒNG */}
            <div className="group/card relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-2xl"></div>
              <div className="relative bg-red-400 border-4 border-black rounded-2xl p-5 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                <TrendingUp className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{stats.averagePoints}</p>
                <p className="text-xs font-black text-black/80 uppercase tracking-wider">Trung bình</p>
              </div>
            </div>
          </div>

          {/* Semester Filter - góc phải */}
          <div className="absolute top-6 right-6">
            <div className="bg-white/10 border-2 border-black rounded-xl p-3 backdrop-blur-sm min-w-[200px]">
              <SemesterFilter value={semester} onChange={setSemester} label="" />
            </div>
          </div>
        </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Progress */}
            <div className="bg-white rounded-xl border p-6">
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
                <p className="text-gray-600">điểm rèn luyện</p>
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
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Thống kê nhanh</h3>
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hoạt động tham gia</span>
                  <span className="font-semibold">{stats.totalActivities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm trung bình</span>
                  <span className="font-semibold">{stats.averagePoints}</span>
                </div>
                {data.summary?.rank_in_class && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Xếp hạng lớp</span>
                    <span className="font-semibold">{data.summary.rank_in_class}/{data.summary.total_students_in_class}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử hoạt động</h3>
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="space-y-4">
              {data.activities?.length > 0 ? (
                data.activities.map(activity => (
                  <ScoreCard key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có hoạt động nào trong kỳ này</p>
                </div>
              )}
            </div>
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