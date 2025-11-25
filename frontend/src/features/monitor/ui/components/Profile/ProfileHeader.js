import React from 'react';
import { User, Hash, GraduationCap, Crown } from 'lucide-react';

/**
 * ProfileHeader Component - Header profile với avatar và stats
 */
export default function ProfileHeader({ 
  profile, 
  stats, 
  avatarUrl, 
  hasValidAvatar 
}) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          {hasValidAvatar ? (
            <img 
              src={avatarUrl} 
              alt={profile?.ho_ten || 'Avatar'} 
              className="w-24 h-24 rounded-full border-4 border-white/50 object-cover shadow-xl" 
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/50 flex items-center justify-center shadow-xl">
              <User className="h-12 w-12 text-white" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
            <Crown className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{profile?.ho_ten || 'Không có tên'}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100">
            <span className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              {profile?.mssv || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {profile?.lop || 'N/A'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400/20 border border-yellow-400/50 rounded-full font-semibold text-yellow-100">
              <Crown className="h-4 w-4" />Lớp trưởng
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-[100px]">
            <div className="text-2xl font-bold">{stats.totalPoints.toFixed(1)}</div>
            <div className="text-xs text-blue-100 mt-1">Điểm RL</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-[100px]">
            <div className="text-2xl font-bold">{stats.completedActivities}</div>
            <div className="text-xs text-blue-100 mt-1">Hoàn thành</div>
          </div>
        </div>
      </div>
    </div>
  );
}

