import React from 'react';
import { Shield } from 'lucide-react';

export default function AdminRegistrationsEmpty() {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center">
      <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">Không tìm thấy đăng ký nào</p>
    </div>
  );
}

