import React from 'react';
import { Calendar, Trophy, Clock, Star, Target } from 'lucide-react';

const StatCard = ({ title, value, icon, colorClass, isMain = false }) => (
    <div className={`p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 ${colorClass}`}>
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold opacity-80">{title}</span>
            {icon}
        </div>
        <p className={`font-bold ${isMain ? 'text-4xl' : 'text-3xl'}`}>{value}</p>
    </div>
);

export default function DashboardStatsGrid({ summary }) {
    const formatNumber = (n) => (Math.round(Number(n || 0) * 10) / 10).toLocaleString('vi-VN');

    return (
        <div className="space-y-4">
            {/* Main Total Points Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-5 rounded-2xl shadow-xl">
                <p className="text-sm font-bold opacity-80">TỔNG ĐIỂM RÈN LUYỆN</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold">{formatNumber(summary.totalPoints)}</p>
                    <p className="text-lg font-semibold opacity-80">/ 100</p>
                </div>
                <div className="mt-2 w-full bg-white/20 rounded-full h-2.5">
                    <div className="bg-white h-2.5 rounded-full" style={{ width: `${summary.progress || 0}%` }}></div>
                </div>
            </div>

            {/* 4 Smaller Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    title="Đã tham gia"
                    value={summary.activitiesJoined || summary.totalActivities || 0}
                    icon={<Trophy size={20} className="opacity-70"/>}
                    colorClass="bg-yellow-100 text-yellow-800"
                />
                <StatCard 
                    title="Hoạt động sắp tới"
                    value={summary.activitiesUpcoming || summary.upcomingActivities?.length || 0}
                    icon={<Clock size={20} className="opacity-70"/>}
                    colorClass="bg-pink-100 text-pink-800"
                />
                <StatCard 
                    title="Hạng lớp"
                    value={
                        summary.classRank && summary.totalStudents
                            ? `${summary.classRank}/${summary.totalStudents}`
                            : '—'
                    }
                    icon={<Star size={20} className="opacity-70"/>}
                    colorClass="bg-blue-100 text-blue-800"
                />
                <StatCard 
                    title="Mục tiêu"
                    value={summary.goalPoints > 0 ? `${summary.goalPoints}đ` : '🎉'}
                    icon={<Target size={20} className="opacity-70"/>}
                    colorClass="bg-green-100 text-green-800"
                />
            </div>
        </div>
    );
}
