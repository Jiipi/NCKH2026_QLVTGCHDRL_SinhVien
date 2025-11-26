import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

export default function ReportsSemesterFilter({ semester, semesterOptions, onSemesterChange, onRefresh }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">Học kỳ:</span>
          <select
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="flex-1 max-w-xs px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white font-medium text-gray-700 hover:border-purple-300 cursor-pointer"
          >
            {semesterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>
      </div>
    </div>
  );
}

