import React from 'react';
import { CheckCircle, Clock, Trophy, Users } from 'lucide-react';

const StatCard = ({ icon, value, label, colorClass }) => (
    <div className="group relative">
        <div className={`absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-xl`}></div>
        <div className={`relative border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 ${colorClass}`}>
            {icon}
            <p className="text-3xl font-black text-black">{value}</p>
            <p className="text-xs font-black text-black/70 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

export default function ApprovalHeader({ stats }) {
    return (
        <div className="relative p-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="mb-8">
                <h1 className="text-5xl font-black mb-2">Phê duyệt Đăng ký</h1>
                <p className="text-xl text-white/80">Quản lý và phê duyệt đăng ký tham gia hoạt động của sinh viên trong lớp.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    icon={<Users className="h-6 w-6 text-black mb-2" />} 
                    value={stats.total || 0}
                    label="Tổng số"
                    colorClass="bg-blue-400"
                />
                <StatCard 
                    icon={<Clock className="h-6 w-6 text-black mb-2" />} 
                    value={stats.pending || 0}
                    label="Chờ duyệt"
                    colorClass="bg-yellow-400"
                />
                <StatCard 
                    icon={<CheckCircle className="h-6 w-6 text-black mb-2" />} 
                    value={stats.approved || 0}
                    label="Đã duyệt"
                    colorClass="bg-green-400"
                />
                <StatCard 
                    icon={<Trophy className="h-6 w-6 text-black mb-2" />} 
                    value={stats.participated || 0}
                    label="Đã tham gia"
                    colorClass="bg-purple-400"
                />
            </div>
        </div>
    );
}
