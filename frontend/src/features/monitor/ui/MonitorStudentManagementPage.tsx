import React from 'react';
import { Users, Search, Download, Star, BarChart3 } from 'lucide-react';
import Pagination from '../../../shared/components/common/Pagination';
import StudentCard from './components/Students/StudentCard';
import StudentDetailModal from './components/Students/StudentDetailModal';
import { useMonitorStudentManagement } from '../model/hooks/useMonitorStudentManagement';
import { StudentPageHero } from '../../../shared/components/student';
import AppLoadingScreen from '../../../shared/components/common/AppLoadingScreen';

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
    return <AppLoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <StudentPageHero
        eyebrow="Không gian lớp trưởng"
        title="Sinh viên lớp học"
        description="Theo dõi thành tích và tiến độ rèn luyện của sinh viên trong lớp."
        heroIcon={Users}
        metrics={[
          { icon: Users, label: 'Tổng sinh viên', value: stats.total, tone: 'text-cyan-600 dark:text-cyan-300' },
          { icon: Star, label: 'Xuất sắc', value: stats.topPerformers, tone: 'text-amber-600 dark:text-amber-300' },
          { icon: BarChart3, label: 'Điểm TB', value: stats.avgPoints, tone: 'text-emerald-600 dark:text-emerald-300' },
        ]}
        actions={(
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950"
          >
            <Download className="h-5 w-5" />
            Xuất Excel
          </button>
        )}
      />

      {/* Filters */}
      <div className="rounded-[2rem] border border-white/60 bg-white/60 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
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
                  className="w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-12 pr-4 text-sm font-semibold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/75 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="md:w-64">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:bg-white/75 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-indigo-500/10"
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
                className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:bg-white/75 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-indigo-500/10"
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
        <div className="mt-8 rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
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
