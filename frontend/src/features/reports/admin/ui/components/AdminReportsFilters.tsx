import React from 'react';
import { Download } from 'lucide-react';

export default function AdminReportsFilters({ semester, onSemesterChange, onExportActivities, onExportRegistrations }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Export Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={onExportActivities} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Xuất hoạt động</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button 
            onClick={onExportRegistrations} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Xuất đăng ký</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}

