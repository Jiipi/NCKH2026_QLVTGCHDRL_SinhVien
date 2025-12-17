import React from 'react';
import { Trophy, Star } from 'lucide-react';

/**
 * TopStudentsList Component - Danh sách top sinh viên
 */
export default function TopStudentsList({ students = [] }) {
  if (!students || students.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-7 w-7 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900">
          TOP SINH VIÊN XUẤT SẮC
        </h3>
      </div>
      
      <div className="space-y-3">
        {students.slice(0, 5).map((student, index) => (
          <div 
            key={index}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              index === 0 ? 'bg-yellow-50 border-yellow-200' :
              index === 1 ? 'bg-gray-50 border-gray-200' :
              index === 2 ? 'bg-orange-50 border-orange-200' :
              'bg-white border-gray-200'
            }`}
          >
            {/* Rank badge */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
              index === 0 ? 'bg-yellow-100 text-yellow-700' :
              index === 1 ? 'bg-gray-100 text-gray-700' :
              index === 2 ? 'bg-orange-100 text-orange-700' :
              'bg-indigo-100 text-indigo-700'
            }`}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </div>
            
            {/* Student info */}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{student.name}</p>
              <p className="text-sm text-gray-600">MSSV: {student.mssv}</p>
            </div>
            
            {/* Points */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <p className="text-2xl font-bold text-gray-900">{student.points}</p>
              </div>
              <p className="text-xs text-gray-600">{student.activities} hoạt động</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

