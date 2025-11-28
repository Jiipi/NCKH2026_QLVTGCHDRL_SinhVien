import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function AdminRegistrationsFilters({
  searchTerm,
  onSearchChange,
  activityFilter,
  onActivityFilterChange,
  activities,
  classId,
  onClassIdChange,
  classes,
  semester,
  onSemesterChange,
  semesterOptions,
  viewMode,
  onViewModeChange,
  stats
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm sinh viên, hoạt động..." 
            value={searchTerm} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select 
            value={activityFilter} 
            onChange={(e) => onActivityFilterChange(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">Tất cả hoạt động</option>
            {activities.map(activity => (
              <option key={activity.id} value={activity.id}>{activity.ten_hd}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select 
            value={classId} 
            onChange={(e) => onClassIdChange(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">Tất cả lớp</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.ten_lop || cls.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select 
            value={semester} 
            onChange={(e) => onSemesterChange(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            {semesterOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="relative md:col-span-1 md:ml-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="all">Tất cả ({stats.total || 0})</option>
            <option value="pending">Chờ duyệt ({stats.pending || 0})</option>
            <option value="approved">Đã duyệt ({stats.approved || 0})</option>
            <option value="rejected">Từ chối ({stats.rejected || 0})</option>
            <option value="participated">Đã tham gia ({stats.participated || 0})</option>
          </select>
        </div>
      </div>
    </div>
  );
}

