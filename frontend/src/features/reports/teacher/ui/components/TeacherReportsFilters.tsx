import React from 'react';
import { Calendar, Filter, RefreshCw, Download } from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

export default function TeacherReportsFilters({
  filterMode,
  setFilterMode,
  semester,
  setSemester,
  dateRange,
  setDateRange,
  onRefresh,
  onExportExcel,
  onExportPDF
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      {/* Filter Mode Toggle */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMode('semester')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'semester' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Lọc theo học kỳ
          </button>
          <button
            onClick={() => setFilterMode('dateRange')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'dateRange' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Lọc theo khoảng thời gian
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Semester or Date Range Filter */}
        {filterMode === 'semester' ? (
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Học kỳ</h3>
            <div className="max-w-md">
              <SemesterFilter value={semester} onChange={setSemester} label="" />
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Khoảng thời gian</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'week' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'month' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'year' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Năm này
              </button>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
}

