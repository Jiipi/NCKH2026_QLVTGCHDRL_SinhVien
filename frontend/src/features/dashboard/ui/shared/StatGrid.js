import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Clock, UserCheck } from 'lucide-react';

const StatCard = ({ title, value, icon, color, bgColor, link }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => link && navigate(link)}
            className={`bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
            style={{ borderLeftColor: color }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: bgColor, color: color }}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default function StatGrid({ stats }) {
    const statItems = [
        {
            title: 'Tổng Người Dùng',
            value: stats.totalUsers || 0,
            icon: <Users size={24} />,
            color: '#3b82f6', // blue-500
            bgColor: '#dbeafe', // blue-100
            link: '/admin/users'
        },
        {
            title: 'Hoạt Động',
            value: stats.totalActivities || 0,
            icon: <Activity size={24} />,
            color: '#10b981', // emerald-500
            bgColor: '#d1fae5', // emerald-100
            link: '/admin/activities'
        },
        {
            title: 'Chờ Phê Duyệt',
            value: stats.pendingApprovals || 0,
            icon: <Clock size={24} />,
            color: '#f59e0b', // amber-500
            bgColor: '#fef3c7', // amber-100
            link: '/admin/approvals'
        },
        {
            title: 'Người Dùng Hoạt Động',
            value: stats.activeUsers || 0,
            icon: <UserCheck size={24} />,
            color: '#8b5cf6', // violet-500
            bgColor: '#ede9fe', // violet-100
            link: '/admin/users' // Link to users page to filter by active
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map(item => (
                <StatCard key={item.title} {...item} />
            ))}
        </div>
    );
}
