import React from 'react';
import { Shield } from 'lucide-react';

export default function AdminDashboardHero() {
  const adminName = 'Quản trị viên';
  const adminInitials = 'QT';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg className="absolute inset-0 w-20 h-20 -rotate-90 transform -translate-x-2 -translate-y-2" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="url(#adminGradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 100 / 100)}`} className="transition-all duration-1000 ease-out" />
            <defs>
              <linearGradient id="adminGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
            <span className="text-2xl font-black text-white">{adminInitials}</span>
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
            Xin chào, {adminName}!
            <Shield className="h-6 w-6 text-red-500 animate-pulse" />
          </h1>
          <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại hệ thống quản trị</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-4 py-1.5 rounded-full text-sm font-black border-2 bg-red-50 text-red-700 border-red-300">
              Quản trị viên
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">
              Toàn quyền hệ thống
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

