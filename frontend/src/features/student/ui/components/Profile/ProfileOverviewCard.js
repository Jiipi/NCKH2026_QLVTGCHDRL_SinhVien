import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function ProfileOverviewCard({ profile, canDisplayImage, directImageUrl }) {
  const initials = (profile?.ho_ten || profile?.name || profile?.email || 'S').slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
      <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden relative">
        {canDisplayImage && (
          <img
            src={directImageUrl}
            alt="Ảnh đại diện"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
        )}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white"
          style={{ display: canDisplayImage ? 'none' : 'flex' }}
        >
          {initials}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile?.ho_ten || profile?.name || 'Chưa cập nhật'}</h3>
        <div className="flex items-center gap-2 text-blue-600 font-medium">
          <GraduationCap className="h-5 w-5" />
          <span>{profile?.roleLabel || 'Sinh viên'}</span>
        </div>
      </div>
    </div>
  );
}

