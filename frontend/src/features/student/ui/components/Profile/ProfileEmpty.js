import React from 'react';

export default function ProfileEmpty() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-ref="student-profile-refactored">
      <div className="text-center max-w-md space-y-3">
        <p className="text-gray-500 text-lg font-medium">Không thể tải thông tin profile</p>
        <p className="text-gray-400 text-sm">Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
      </div>
    </div>
  );
}

