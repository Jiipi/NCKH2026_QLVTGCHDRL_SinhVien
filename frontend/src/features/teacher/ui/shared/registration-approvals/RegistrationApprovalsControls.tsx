import React from 'react';
import { Search, Calendar, Users, Grid3X3, List } from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'cho_duyet', label: 'Chờ duyệt' },
  { value: 'da_duyet', label: 'Đã duyệt' },
  { value: 'tu_choi', label: 'Từ chối' },
  { value: 'da_tham_gia', label: 'Đã tham gia' }
];

export default function RegistrationApprovalsControls({
  search,
  onSearchChange,
  semester,
  onSemesterChange,
  classId,
  classes,
  onClassChange,
  status,
  onStatusChange,
  viewMode,
  onViewModeChange
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mb-6" data-ref="registration-approvals-controls">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Tìm theo tên sinh viên, MSSV hoặc hoạt động..."
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <SemesterFilter value={semester} onChange={onSemesterChange} label="" />
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <Users className="h-4 w-4 text-blue-600" />
              <select
                value={classId || ''}
                onChange={(e) => onClassChange?.(e.target.value || '')}
                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="">Tất cả lớp</option>
                {(classes || []).map((clazz) => (
                  <option key={clazz.id} value={clazz.id}>{clazz.ten_lop || clazz.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => onViewModeChange?.('grid')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Lưới
              </button>
              <button
                onClick={() => onViewModeChange?.('list')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow text-indigo-600 border border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
                Danh sách
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange?.(option.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                status === option.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


