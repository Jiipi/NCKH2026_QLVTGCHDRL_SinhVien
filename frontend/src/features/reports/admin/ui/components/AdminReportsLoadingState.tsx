import React from 'react';
import { Loader } from 'lucide-react';

export default function AdminReportsLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-8">
      <div className="group relative">
        <div className="absolute inset-0 bg-black transform translate-x-3 translate-y-3 rounded-2xl" />
        <div className="relative bg-white border-4 border-black rounded-2xl p-12 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-400 blur-xl opacity-50 animate-pulse rounded-full" />
            <div className="relative bg-purple-400 border-4 border-black p-4 rounded-full">
              <Loader className="h-12 w-12 text-black animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wide">Đang tải dữ liệu</h3>
          <p className="text-gray-600 font-bold">Vui lòng chờ trong giây lát...</p>
          <div className="flex gap-2 mt-4">
            <span className="w-3 h-3 bg-purple-400 border-2 border-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-3 h-3 bg-pink-400 border-2 border-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-3 h-3 bg-indigo-400 border-2 border-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

