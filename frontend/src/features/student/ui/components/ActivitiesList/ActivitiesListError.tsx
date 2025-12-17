import React from 'react';
import { Award } from 'lucide-react';

export default function ActivitiesListError({ message }) {
  return (
    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <div className="bg-red-500 rounded-xl p-3">
          <Award className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-red-900 font-semibold">Đã xảy ra lỗi</p>
          <p className="text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

