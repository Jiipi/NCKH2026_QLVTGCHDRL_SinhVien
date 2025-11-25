import React from 'react';
import { Inbox } from 'lucide-react';

export default function RegistrationEmptyState({ status }) {
  const message = {
    cho_duyet: 'Không có đăng ký chờ duyệt',
    da_duyet: 'Chưa có đăng ký nào được duyệt',
    tu_choi: 'Không có đăng ký bị từ chối',
    da_tham_gia: 'Không có sinh viên nào đã tham gia'
  }[status] || 'Không có đăng ký nào phù hợp';

  return (
    <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
      <Inbox className="h-14 w-14 text-gray-300 mx-auto mb-4" />
      <p className="text-lg font-semibold text-gray-600 mb-2">{message}</p>
      <p className="text-sm text-gray-500">Thay đổi bộ lọc hoặc kiểm tra lại ở học kỳ khác.</p>
    </div>
  );
}


