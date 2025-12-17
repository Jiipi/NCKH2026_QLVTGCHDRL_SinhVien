import React from 'react';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useMonitorReports } from '../model/hooks/useMonitorReports';
import ReportsHeader from './components/Reports/ReportsHeader';
import ChartSelector from './components/Reports/ChartSelector';
import ParticipationChart from './components/Reports/ParticipationChart';
import ActivitiesChart from './components/Reports/ActivitiesChart';
import PointsChart from './components/Reports/PointsChart';
import TopStudentsList from './components/Reports/TopStudentsList';

export default function MonitorReportsPage() {
  const {
    reportData,
    loading,
    error,
    semester,
    setSemester,
    semesterOptions,
    selectedChart,
    setSelectedChart,
    getScoreTheme,
    loadReportData,
    handleExportExcel,
    handleExportPDF
  } = useMonitorReports();

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Không thể tải báo cáo</h2>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">💡 Giải pháp:</h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Kiểm tra bạn đã được gán vào lớp nào chưa</li>
                <li>Liên hệ admin để được gán làm lớp trưởng</li>
                <li>Đảm bảo tài khoản có role LOP_TRUONG</li>
              </ul>
            </div>
            <button
              onClick={loadReportData}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overview = reportData?.overview || {};
  const avgScore = Number(overview.avgPoints || 0);

  return (
    <div className="space-y-6">
      <ReportsHeader 
        overview={overview}
        avgScore={avgScore}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      {/* Semester Filter */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Học kỳ:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white font-medium text-gray-700 hover:border-purple-300 cursor-pointer"
            >
              {semesterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ChartSelector 
        selectedChart={selectedChart}
        onChartChange={setSelectedChart}
      />

      {/* Charts */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8">
        {selectedChart === 'participation' && (
          <ParticipationChart data={reportData?.pointsDistribution || []} />
        )}
        
        {selectedChart === 'activities' && (
          <ActivitiesChart 
            data={reportData?.activityTypes || []}
            totalActivities={overview.totalActivities || 0}
          />
        )}
        
        {selectedChart === 'points' && (
          <PointsChart 
            attendanceData={reportData?.attendanceRate || []}
            monthlyData={reportData?.monthlyActivities || []}
            overview={overview}
          />
        )}
      </div>

      <TopStudentsList students={reportData?.topStudents || []} />
    </div>
  );
}
