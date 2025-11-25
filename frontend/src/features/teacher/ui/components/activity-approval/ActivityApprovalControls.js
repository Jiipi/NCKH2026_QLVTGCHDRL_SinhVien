import React from 'react';
import { Search, Calendar, Grid3X3, List } from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

export default function ActivityApprovalControls({
  searchTerm,
  onSearchChange,
  semester,
  onSemesterChange,
  displayViewMode,
  onDisplayViewModeChange
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mb-6">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm hoạt động..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Học kỳ:</span>
          <SemesterFilter value={semester} onChange={onSemesterChange} label="" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
            <button
              onClick={() => onDisplayViewModeChange?.('grid')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                displayViewMode === 'grid'
                  ? 'bg-white shadow-md text-blue-600 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Hiển thị dạng lưới"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Lưới</span>
            </button>
            <button
              onClick={() => onDisplayViewModeChange?.('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                displayViewMode === 'list'
                  ? 'bg-white shadow-md text-blue-600 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Hiển thị dạng danh sách"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


