import React from 'react';
import { User, Mail, Eye, Activity, Target, ChevronRight, Crown, Medal, Trophy } from 'lucide-react';
import { getStudentAvatar, getAvatarGradient } from '../../../../../shared/lib/avatar';

// Helper để render rank icon
const renderRankIcon = (rank, getRankIcon) => {
  const iconStr = getRankIcon(rank);
  if (iconStr) return <span className="text-lg">{iconStr}</span>;
  
  // Fallback to lucide icons
  if (rank === 1) return <Crown className="h-5 w-5" />;
  if (rank === 2) return <Medal className="h-5 w-5" />;
  if (rank === 3) return <Medal className="h-5 w-5" />;
  return <Trophy className="h-4 w-4" />;
};

/**
 * StudentCard Component - Hiển thị thẻ sinh viên
 */
export default function StudentCard({ 
  student, 
  getRankIcon,
  getRankBadgeClass,
  getPointsColor,
  getProgressColor,
  onViewDetails
}) {
  const progressPercent = Math.min((student.totalPoints / 100) * 100, 100);
  const isTopRanked = student.rank <= 3;
  const avatar = getStudentAvatar(student);

  return (
    <div className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${
      isTopRanked ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'
    }`}>
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Top performer badge */}
      {isTopRanked && (
        <div className="absolute top-0 right-0">
          <div className={`${getRankBadgeClass(student.rank)} px-4 py-2 rounded-bl-2xl rounded-tr-2xl shadow-lg flex items-center gap-2`}>
            {renderRankIcon(student.rank, getRankIcon)}
            <span className="text-sm font-bold">#{student.rank}</span>
          </div>
        </div>
      )}

      <div className="p-4 relative z-10">
        {/* Student Header - Compact */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            {avatar.hasValidAvatar ? (
              <img
                src={avatar.src}
                alt={avatar.alt}
                className="w-16 h-16 rounded-xl object-cover shadow-md ring-2 ring-white"
              />
            ) : (
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAvatarGradient(student.nguoi_dung?.ho_ten || student.mssv)} flex items-center justify-center text-white font-bold text-xl shadow-md ring-2 ring-white`}>
                {avatar.fallback}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
              {student.nguoi_dung.ho_ten}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
              <User className="h-3 w-3" />
              <span className="font-medium">MSSV: {student.mssv}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Mail className="h-3 w-3" />
              <span className="truncate">{student.nguoi_dung.email}</span>
            </div>
          </div>
          {!isTopRanked && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              #{student.rank}
            </span>
          )}
        </div>

        {/* Points Display - Compact */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-3 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Điểm rèn luyện</span>
            <span className={`text-2xl font-bold ${getPointsColor(student.totalPoints)}`}>
              {student.totalPoints}
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(student.totalPoints)} transition-all duration-500 rounded-full`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/60 rounded-lg p-2 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Activity className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Hoạt động</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{student.activitiesJoined}</p>
          </div>

          <div className="bg-white/60 rounded-lg p-2 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1.5 bg-purple-50 rounded-md">
                <Target className="h-3 w-3 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Còn lại</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{Math.max(0, 100 - student.totalPoints)}</p>
          </div>
        </div>

        {/* Action Button - Compact */}
        <button
          onClick={() => onViewDetails(student)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-xs"
        >
          <Eye className="h-3.5 w-3.5" />
          Xem chi tiết
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

