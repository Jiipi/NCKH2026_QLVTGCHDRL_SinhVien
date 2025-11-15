import React from 'react';
import { Sparkles } from 'lucide-react';

const getClassification = (points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
};

export default function StudentDashboardHeader({ userProfile, studentInfo = {}, summary }) {
    if (!userProfile || !summary) return null;

    const classification = getClassification(summary.totalPoints);
    const avatarFallback = (userProfile.ho_ten || 'SV').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div>
            <div className="flex items-center gap-4 mb-3">
                <div className="relative w-20 h-20">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                        <circle
                            cx="40" cy="40" r="36" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 36}`}
                            strokeDashoffset={`${2 * Math.PI * 36 * (1 - (summary.progress || 0) / 100)}`}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="w-16 h-16 absolute top-2 left-2 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
                        {userProfile.anh_dai_dien ? (
                            <img src={userProfile.anh_dai_dien} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-gray-600">{avatarFallback}</span>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        Xin chào, {userProfile.ho_ten}!
                        <Sparkles className="h-6 w-6 text-yellow-400" />
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">Chào mừng bạn quay trở lại.</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${classification.bg} ${classification.color} ${classification.border}`}>
                            {classification.text}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">{(studentInfo && studentInfo.mssv) ? studentInfo.mssv : 'N/A'}</span>
                        <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-md">{(studentInfo && studentInfo.ten_lop) ? studentInfo.ten_lop : 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
