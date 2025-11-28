import React from 'react';
import { Shield, Download } from 'lucide-react';

export default function AdminRegistrationsHero({ onExport, exporting, canExport }) {
  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl shadow-2xl p-8 mb-6">
      <div className="flex justify-between items-start">
        <div className="text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Quản Lý Đăng Ký</h1>
              <p className="text-orange-100 mt-1">Phê duyệt và theo dõi đăng ký hoạt động</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onExport} 
            disabled={exporting || !canExport} 
            className="px-4 py-2 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}

