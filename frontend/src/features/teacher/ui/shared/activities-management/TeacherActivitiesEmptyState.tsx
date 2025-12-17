import React from 'react';
import { Activity, Search } from 'lucide-react';

export default function TeacherActivitiesEmptyState({ viewMode, searchTerm, statusFilter }) {
  const Icon = searchTerm ? Search : Activity;
  const title = searchTerm
    ? 'Không tìm thấy hoạt động phù hợp'
    : statusFilter === 'cho_duyet'
      ? 'Không có hoạt động chờ duyệt'
      : statusFilter === 'da_duyet'
        ? 'Không có hoạt động đã duyệt'
        : statusFilter === 'tu_choi'
          ? 'Không có hoạt động bị từ chối'
          : 'Chưa có hoạt động trong danh sách';

  const description = searchTerm
    ? 'Thử dùng từ khóa khác hoặc xóa bớt bộ lọc.'
    : 'Tạo hoặc yêu cầu sinh viên gửi thêm hoạt động mới.';

  return (
    <div className={`col-span-full text-center py-12 bg-white rounded-2xl border border-dashed ${viewMode === 'grid' ? 'border-gray-200' : 'border-gray-300'}`} data-ref="teacher-activities-empty-state">
      <Icon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}


