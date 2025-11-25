import React from 'react';
import { Users, Search, Filter, Award, TrendingUp, Eye, Mail, Phone, Calendar, User, BookOpen, Trophy, AlertCircle, Download, Star, Medal, Target, Activity, Sparkles, Crown, ChevronRight, BarChart3 } from 'lucide-react';
import Pagination from '../../../shared/components/common/Pagination';
import StudentCard from './components/Students/StudentCard';
import StudentDetailModal from './components/Students/StudentDetailModal';
import { useMonitorStudentManagement } from '../model/hooks/useMonitorStudentManagement';

export default function MonitorStudentManagementPage() {
  const {
    students,
    filteredStudents,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    semester,
    setSemester,
    semesterOptions,
    pagination,
    setPagination,
    showDetails,
    setShowDetails,
    getRankIcon,
    getRankBadgeClass,
    getPointsColor,
    getProgressColor,
    handleExportData,
    filteredTotal
  } = useMonitorStudentManagement();

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
          </div>
        </div>
      </div>

      {/* Students Grid - Compact */}
      {students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map(student => (
            <StudentCard 
              key={student.id} 
              student={student}
              getRankIcon={getRankIcon}
              getRankBadgeClass={getRankBadgeClass}
              getPointsColor={getPointsColor}
              getProgressColor={getProgressColor}
              onViewDetails={setShowDetails}
            />
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

      {/* Pagination Controls - Pattern từ trang sinh viên */}
      {filteredTotal > pagination.limit && (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 mt-8">
          <Pagination
            pagination={{ ...pagination, total: filteredTotal }}
            onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
            itemLabel="sinh viên"
            showLimitSelector={true}
          />
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
