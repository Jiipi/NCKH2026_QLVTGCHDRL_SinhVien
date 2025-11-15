import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import SemesterFilter from '../../../shared/components/common/SemesterFilter';

export const TeacherActivityFilters = ({ 
  searchTerm, onSearchTermChange,
  semester, onSemesterChange,
  statusFilter, onStatusFilterChange,
  pagination, onPaginationChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm hoạt động..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Semester Filter */}
        <div className="relative flex items-center">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          <div className="w-full pl-10">
            <SemesterFilter value={semester} onChange={onSemesterChange} label="" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="cho_duyet">Chờ duyệt</option>
            <option value="da_duyet">Đã duyệt</option>
            <option value="tu_choi">Từ chối</option>
            <option value="da_huy">Đã hủy</option>
            <option value="ket_thuc">Kết thúc</option>
          </select>
        </div>

        {/* Page size */}
        <select
          value={pagination.limit}
          onChange={(e) => onPaginationChange('limit', Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          title="Số hoạt động mỗi trang"
        >
          <option value={10}>10 hoạt động / trang</option>
          <option value={20}>20 hoạt động / trang</option>
          <option value={50}>50 hoạt động / trang</option>
        </select>
      </div>
    </div>
  );
};
