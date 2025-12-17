import React from 'react';
import { Mail, Activity, Trophy, Target } from 'lucide-react';
import { getStudentAvatar, getAvatarGradient } from '../../../../../shared/lib/avatar';

/**
 * StudentDetailModal Component - Modal hiển thị chi tiết sinh viên
 */
export default function StudentDetailModal({ student, onClose }) {
  if (!student) return null;

  const progressPercent = Math.min((student.totalPoints / 100) * 100, 100);
  const avatar = getStudentAvatar(student);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Thông tin sinh viên</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            {avatar.hasValidAvatar ? (
              <img
                src={avatar.src}
                alt={avatar.alt}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white/50"
              />
            ) : (
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(student.nguoi_dung?.ho_ten || student.mssv)} flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/50`}>
                {avatar.fallback}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{student.nguoi_dung.ho_ten}</h3>
              <p className="text-indigo-100">MSSV: {student.mssv}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Points Progress */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">Điểm rèn luyện</span>
              <span className="text-4xl font-bold text-indigo-600">{student.totalPoints}</span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>0</span>
              <span>{progressPercent.toFixed(0)}%</span>
              <span>100</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail className="h-5 w-5" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-gray-900 font-semibold truncate">{student.nguoi_dung.email}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-medium">Hoạt động</span>
              </div>
              <p className="text-gray-900 font-semibold">{student.activitiesJoined} hoạt động</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-medium">Xếp hạng</span>
              </div>
              <p className="text-gray-900 font-semibold">#{student.rank}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Còn lại</span>
              </div>
              <p className="text-gray-900 font-semibold">{Math.max(0, 100 - student.totalPoints)} điểm</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

