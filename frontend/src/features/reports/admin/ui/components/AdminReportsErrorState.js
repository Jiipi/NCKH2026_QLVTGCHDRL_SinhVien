import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function AdminReportsErrorState({ error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-8">
      <div className="group relative">
        <div className="absolute inset-0 bg-red-800 transform translate-x-3 translate-y-3 rounded-2xl" />
        <div className="relative bg-red-100 border-4 border-red-800 rounded-2xl p-12 max-w-lg text-center">
          <div className="relative mb-6 inline-block">
            <div className="absolute inset-0 bg-red-400 blur-xl opacity-50 rounded-full" />
            <div className="relative bg-red-400 border-4 border-red-800 p-4 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-800" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-red-800 mb-3 uppercase tracking-wide">Có lỗi xảy ra</h3>
          <p className="text-red-700 font-bold mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="group/btn relative inline-flex"
          >
            <div className="absolute inset-0 bg-red-800 transform translate-x-1 translate-y-1 rounded-xl" />
            <div className="relative flex items-center gap-2 px-6 py-3 bg-red-400 text-red-900 border-3 border-red-800 rounded-xl hover:bg-red-500 transition-all font-black transform group-hover/btn:-translate-x-0.5 group-hover/btn:-translate-y-0.5">
              <RefreshCcw className="h-5 w-5" />
              Tải lại trang
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

