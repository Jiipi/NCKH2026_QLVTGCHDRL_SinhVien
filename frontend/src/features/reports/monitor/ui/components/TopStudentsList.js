import React from 'react';
import { Trophy, Star } from 'lucide-react';

export default function TopStudentsList({ students }) {
  if (!students?.length) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-30"></div>
          <Trophy className="relative h-8 w-8 text-yellow-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900">
          TOP SINH VIÊN XUẤT SẮC
        </h3>
      </div>
      
      <div className="space-y-4">
        {students.slice(0, 5).map((student, index) => (
          <StudentCard key={index} student={student} rank={index} />
        ))}
      </div>
    </div>
  );
}

function StudentCard({ student, rank }) {
  const getRankStyle = (index) => {
    if (index === 0) return { shadow: 'bg-yellow-400', card: 'from-yellow-100 to-amber-100', badge: 'bg-yellow-400 text-black', emoji: '🥇' };
    if (index === 1) return { shadow: 'bg-gray-400', card: 'from-gray-100 to-slate-100', badge: 'bg-gray-400 text-white', emoji: '🥈' };
    if (index === 2) return { shadow: 'bg-orange-400', card: 'from-orange-100 to-amber-100', badge: 'bg-orange-400 text-white', emoji: '🥉' };
    return { shadow: 'bg-purple-400', card: 'from-purple-100 to-pink-100', badge: 'bg-purple-500 text-white', emoji: `#${index + 1}` };
  };

  const style = getRankStyle(rank);

  return (
    <div className="group relative">
      {/* Brutalist shadow */}
      <div className={`absolute inset-0 transform translate-x-2 translate-y-2 rounded-xl ${style.shadow}`}></div>
      
      {/* Main card */}
      <div className={`relative flex items-center gap-4 p-5 rounded-xl border-4 border-black transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 bg-gradient-to-r ${style.card}`}>
        {/* Rank badge */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl border-4 border-black ${style.badge}`}>
          {style.emoji}
        </div>
        
        {/* Student info */}
        <div className="flex-1">
          <p className="font-black text-gray-900 text-lg">{student.name}</p>
          <p className="text-sm font-bold text-gray-600">MSSV: {student.mssv}</p>
        </div>
        
        {/* Points */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <p className="text-3xl font-black text-gray-900">{student.points}</p>
          </div>
          <p className="text-xs font-bold text-gray-600 uppercase">{student.activities} hoạt động</p>
        </div>
      </div>
    </div>
  );
}

