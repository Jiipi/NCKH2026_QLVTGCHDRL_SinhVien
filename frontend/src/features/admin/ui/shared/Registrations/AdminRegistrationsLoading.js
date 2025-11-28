import React from 'react';

export default function AdminRegistrationsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30 p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách đăng ký...</p>
        </div>
      </div>
    </div>
  );
}

