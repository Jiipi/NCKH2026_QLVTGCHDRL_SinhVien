import React from 'react';
import { RefreshCw, Download } from 'lucide-react';

export default function TeacherReportsFilters({
  dateRange,
  setDateRange,
  semester,
  semesterOptions = [],
  setSemester,
  filterMode,
  setFilterMode,
  onRefresh,
  onExportExcel,
  onExportPDF
}) {
  const selectDateRange = (nextRange) => {
    setDateRange(nextRange);
    setFilterMode?.('dateRange');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Học kỳ báo cáo</h3>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <select
              value={semester || ''}
              onChange={(event) => {
                setSemester?.(event.target.value);
                setFilterMode?.('semester');
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 xl:max-w-xs"
            >
              {semesterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => selectDateRange('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === 'dateRange' && dateRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => selectDateRange('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === 'dateRange' && dateRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => selectDateRange('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === 'dateRange' && dateRange === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Năm nay
              </button>
            </div>
          </div>
        </div>

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
