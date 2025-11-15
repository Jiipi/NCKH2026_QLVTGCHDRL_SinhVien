import React from 'react';
import { Search, Filter } from 'lucide-react';
import useSemesterData from '../../../hooks/useSemesterData';

export const AdminActivityFilters = ({ filters, onFilterChange, activityTypes }) => {
  const { options: semesterOptions } = useSemesterData();

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Tìm hoạt động, mô tả..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="cho_duyet">Chờ duyệt</option>
            <option value="da_duyet">Đã duyệt</option>
            <option value="tu_choi">Từ chối</option>
            <option value="da_huy">Đã hủy</option>
            <option value="ket_thuc">Kết thúc</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={filters.typeId}
            onChange={(e) => onFilterChange('typeId', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
          >
            <option value="">Tất cả loại hoạt động</option>
            {activityTypes.map(t => (
              <option key={t.id} value={t.id}>{t.ten_loai_hd || t.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={filters.semester}
            onChange={(e) => onFilterChange('semester', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
          >
            {(semesterOptions || []).map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
