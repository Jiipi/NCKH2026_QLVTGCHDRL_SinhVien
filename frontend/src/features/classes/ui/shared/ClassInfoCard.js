import React from 'react';
import { GraduationCap } from 'lucide-react';

/**
 * formatDate - Utility function to format date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

/**
 * ClassInfoCard - Card component for class information
 */
export default function ClassInfoCard({ selectedClass }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.ten_lop}</h2>
          <p className="text-gray-600">Thông tin chi tiết lớp học</p>
        </div>
        <div className="p-3 bg-indigo-100 rounded-lg">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Khoa</label>
          <p className="text-base font-semibold text-gray-900">{selectedClass.khoa || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Niên khóa</label>
          <p className="text-base font-semibold text-gray-900">{selectedClass.nien_khoa || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Năm nhập học</label>
          <p className="text-base text-gray-900">{formatDate(selectedClass.nam_nhap_hoc)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Năm tốt nghiệp dự kiến</label>
          <p className="text-base text-gray-900">{formatDate(selectedClass.nam_tot_nghiep)}</p>
        </div>
      </div>
    </div>
  );
}

