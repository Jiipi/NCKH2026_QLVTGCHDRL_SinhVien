import React from 'react';
import { Search, Filter, Users, CheckCircle, XCircle } from 'lucide-react';

export default function UserFilters({ 
    searchTerm, onSearchTermChange,
    roleFilter, onRoleFilterChange,
    statusFilter, onStatusFilterChange,
    roles,
    userStats = { total: 0, active: 0, locked: 0 }
}) {

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, mã số..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
            <Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
                value={roleFilter}
                onChange={(e) => onRoleFilterChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition bg-white appearance-none"
            >
                <option value="">Tất cả vai trò</option>
                {roles.map(role => <option key={role.id} value={role.ten_vt}>{role.ten_vt}</option>)}
            </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
            <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition bg-white appearance-none"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="hoat_dong">Đang hoạt động</option>
                <option value="khong_hoat_dong">Không hoạt động</option>
                <option value="khoa">Bị khóa</option>
            </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-200">
        <button onClick={() => onStatusFilterChange('')} className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition ${statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <Users size={16} /> Tất cả ({userStats.total})
        </button>
        <button onClick={() => onStatusFilterChange('hoat_dong')} className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition ${statusFilter === 'hoat_dong' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <CheckCircle size={16} /> Hoạt động ({userStats.active})
        </button>
        <button onClick={() => onStatusFilterChange('khoa')} className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition ${statusFilter === 'khoa' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <XCircle size={16} /> Bị khóa ({userStats.locked})
        </button>
      </div>
    </div>
  );
}

