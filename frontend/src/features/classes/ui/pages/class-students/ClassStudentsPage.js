import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Award, TrendingUp, Eye, Mail, Phone, Calendar, User, BookOpen, Trophy, AlertCircle, Download, RefreshCw, Star, Medal, Target, Activity, Sparkles, Crown, ChevronRight, BarChart3 } from 'lucide-react';
import http from '../../../shared/services/api/client';
import { getStudentAvatar, getAvatarGradient } from '../../../shared/lib/avatar';
import useSemesterData from '../../../shared/hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../../shared/lib/semester';

export default function ClassStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('points_desc');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  
  const [semester, setSemester] = useState(() => getCurrentSemesterValue(true));
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(null);

  // Unified semester options
  const { options: semesterOptions, currentSemester } = useSemesterData();

  // Sync with backend current semester when available
  useEffect(() => {
    if (currentSemester && semesterOptions.length > 0) {
      const inOptions = semesterOptions.some(opt => opt.value === currentSemester);
      if (inOptions && semester !== currentSemester) {
        setSemester(currentSemester);
      }
    }
  }, [currentSemester, semesterOptions, semester]);

  useEffect(() => {
    loadStudents();
  }, [semester, pagination.page, pagination.limit]); // Reload when semester or pagination changes

  const loadStudents = async () => {
    try {
      setLoading(true);
      const endpoints = ['/monitor/students', '/class/students', '/teacher/students'];
      let response = null;
      
      // Always send semester parameter with pagination
      const params = { 
        semester,
        page: pagination.page,
        limit: pagination.limit
      };
      
      for (const ep of endpoints) {
        try {
          response = await http.get(ep, { params });
          if (response.data) break;
        } catch (e) {
          continue;
        }
      }
      
      const responseData = response?.data?.data || response?.data || {};
      const raw = responseData.students || responseData.items || responseData || [];
      const total = responseData.total || (Array.isArray(raw) ? raw.length : 0);
      
      const normalized = (Array.isArray(raw) ? raw : []).map(sv => {
        const nguoiDung = sv.nguoi_dung || {};
        const lop = sv.lop || {};
        
        return {
          id: sv.id,
          mssv: sv.mssv || '',
          ngay_sinh: sv.ngay_sinh,
          gt: sv.gt,
          dia_chi: sv.dia_chi,
          sdt: sv.sdt,
          nguoi_dung: {
            ho_ten: nguoiDung.ho_ten || '',
            email: nguoiDung.email || '',
            anh_dai_dien: nguoiDung.anh_dai_dien || nguoiDung.avatar || nguoiDung.profile_image || nguoiDung.image || sv.anh_dai_dien || sv.avatar || sv.profile_image
          },
          lop: {
            ten_lop: lop.ten_lop || '',
            khoa: lop.khoa || ''
          },
          totalPoints: sv._count?.diem_danh || sv.totalPoints || 0,
          activitiesJoined: sv._count?.dang_ky_hd || sv.activitiesJoined || 0,
          rank: sv.rank || 0,
          status: sv.status || 'active',
          lastActivityDate: sv.lastActivityDate || new Date().toISOString()
        };
      });
      
      // Add ranking
      const sorted = normalized.sort((a, b) => b.totalPoints - a.totalPoints);
      sorted.forEach((student, index) => {
        student.rank = index + 1;
      });
      
      setStudents(sorted);
      setPagination(prev => ({ ...prev, total }));
      setError('');
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Không thể tải danh sách sinh viên');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const headers = ['MSSV', 'Họ tên', 'Email', 'Điểm RL', 'Số hoạt động', 'Xếp hạng'];
    const csvData = students.map(student => [
      student.mssv,
      student.nguoi_dung.ho_ten,
      student.nguoi_dung.email,
      student.totalPoints,
      student.activitiesJoined,
      student.rank
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_sinh_vien_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <Trophy className="h-5 w-5 text-gray-400" />;
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700';
  };

  const getPointsColor = (points) => {
    if (points >= 80) return 'text-emerald-600';
    if (points >= 50) return 'text-blue-600';
    if (points >= 30) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getProgressColor = (points) => {
    if (points >= 80) return 'from-emerald-500 to-teal-500';
    if (points >= 50) return 'from-blue-500 to-cyan-500';
    if (points >= 30) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  const sortedStudents = [...students].sort((a, b) => {
    switch (sortBy) {
      case 'points_desc': return b.totalPoints - a.totalPoints;
      case 'points_asc': return a.totalPoints - b.totalPoints;
      case 'name_asc': return a.nguoi_dung.ho_ten.localeCompare(b.nguoi_dung.ho_ten, 'vi');
      case 'name_desc': return b.nguoi_dung.ho_ten.localeCompare(a.nguoi_dung.ho_ten, 'vi');
      case 'activities_desc': return b.activitiesJoined - a.activitiesJoined;
      default: return 0;
    }
  });

  const filteredStudents = sortedStudents.filter(student =>
    student.nguoi_dung.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.mssv.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nguoi_dung.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    avgPoints: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.totalPoints, 0) / students.length) : 0,
    topPerformers: students.filter(s => s.totalPoints >= 90).length // ✅ Xuất sắc: >= 90 điểm (thống nhất với Dashboard)
  };

  const StudentCard = ({ student }) => {
    const progressPercent = Math.min((student.totalPoints / 100) * 100, 100);
    const isTopRanked = student.rank <= 3;
    const avatar = getStudentAvatar(student);

    return (
      <div className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${
        isTopRanked ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'
      }`}>
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Top performer badge */}
        {isTopRanked && (
          <div className="absolute top-0 right-0">
            <div className={`${getRankBadgeClass(student.rank)} px-4 py-2 rounded-bl-2xl rounded-tr-2xl shadow-lg flex items-center gap-2`}>
              {getRankIcon(student.rank)}
              <span className="text-sm font-bold">#{student.rank}</span>
            </div>
          </div>
        )}

        <div className="p-4 relative z-10">
          {/* Student Header - Compact */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              {avatar.hasValidAvatar ? (
                <img
                  src={avatar.src}
                  alt={avatar.alt}
                  className="w-16 h-16 rounded-xl object-cover shadow-md ring-2 ring-white"
                />
              ) : (
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(student.nguoi_dung?.ho_ten || student.mssv)} flex items-center justify-center text-white font-bold text-xl shadow-md ring-2 ring-white`}>
                  {avatar.fallback}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
                {student.nguoi_dung.ho_ten}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                <User className="h-3 w-3" />
                <span className="font-medium">MSSV: {student.mssv}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Mail className="h-3 w-3" />
                <span className="truncate">{student.nguoi_dung.email}</span>
              </div>
            </div>
            {!isTopRanked && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                #{student.rank}
              </span>
            )}
          </div>

          {/* Points Display - Compact */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-3 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Điểm rèn luyện</span>
              <span className={`text-2xl font-bold ${getPointsColor(student.totalPoints)}`}>
                {student.totalPoints}
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(student.totalPoints)} transition-all duration-500 rounded-full`}
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/60 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <Activity className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">Hoạt động</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{student.activitiesJoined}</p>
            </div>

            <div className="bg-white/60 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-1.5 bg-purple-50 rounded-md">
                  <Target className="h-3 w-3 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">Còn lại</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{Math.max(0, 100 - student.totalPoints)}</p>
            </div>
          </div>

          {/* Action Button - Compact */}
          <button
            onClick={() => setShowDetails(student)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            Xem chi tiết
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
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
                  <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-cyan-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-cyan-400">
                    👥 SINH VIÊN
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {stats.total} SINH VIÊN
                  </div>
                </div>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold"
              >
                <Download className="h-5 w-5" />
                Xuất Excel
              </button>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">S</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">I</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">V</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">I</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ê</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                    LỚP HỌC
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-cyan-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Theo dõi thành tích và tiến độ rèn luyện của sinh viên trong lớp
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 - Total */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Users className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.total}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG SINH VIÊN</p>
                </div>
              </div>

              {/* Card 2 - Top Performers */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Star className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.topPerformers}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">XUẤT SẮC</p>
                </div>
              </div>

              {/* Card 3 - Average */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <BarChart3 className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.avgPoints}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐIỂM TB</p>
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

      {/* Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sinh viên, MSSV, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 bg-white"
                />
              </div>
            </div>

            <div className="md:w-64">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
              >
                {semesterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
              >
                <option value="points_desc">⭐ Điểm cao nhất</option>
                <option value="points_asc">📉 Điểm thấp nhất</option>
                <option value="name_asc">🔤 Tên A-Z</option>
                <option value="name_desc">🔤 Tên Z-A</option>
                <option value="activities_desc">📊 Nhiều hoạt động</option>
              </select>
            </div>

            <button
              onClick={loadStudents}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center gap-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid - Compact */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy sinh viên</h3>
              <p className="text-gray-600 text-lg">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
            </div>
          </div>
        )}

      {/* Pagination Controls */}
      {pagination.total > pagination.limit && (
        <div className="mt-8 flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} sinh viên
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-600 px-3">
              Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp →
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetails && (
        <StudentDetailModal
          student={showDetails}
          onClose={() => setShowDetails(null)}
        />
      )}
    </div>
  );
}

// Student Detail Modal Component
const StudentDetailModal = ({ student, onClose }) => {
  const progressPercent = Math.min((student.totalPoints / 100) * 100, 100);
  const avatar = getStudentAvatar(student);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Thông tin sinh viên</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            {avatar.hasValidAvatar ? (
              <img
                src={avatar.src}
                alt={avatar.alt}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white/50"
              />
            ) : (
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(student.nguoi_dung?.ho_ten || student.mssv)} flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/50`}>
                {avatar.fallback}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{student.nguoi_dung.ho_ten}</h3>
              <p className="text-indigo-100">MSSV: {student.mssv}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Points Progress */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">Điểm rèn luyện</span>
              <span className="text-4xl font-bold text-indigo-600">{student.totalPoints}</span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>0</span>
              <span>{progressPercent.toFixed(0)}%</span>
              <span>100</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail className="h-5 w-5" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-gray-900 font-semibold truncate">{student.nguoi_dung.email}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-medium">Hoạt động</span>
              </div>
              <p className="text-gray-900 font-semibold">{student.activitiesJoined} hoạt động</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-medium">Xếp hạng</span>
              </div>
              <p className="text-gray-900 font-semibold">#{student.rank}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Còn lại</span>
              </div>
              <p className="text-gray-900 font-semibold">{Math.max(0, 100 - student.totalPoints)} điểm</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
