import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, BarChart3, Settings } from 'lucide-react';

const ActionCard = ({ title, description, icon, link, colorClass }) => {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => navigate(link)}
            className={`p-6 rounded-xl text-white text-center cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${colorClass}`}
        >
            <div className="mb-4 inline-block p-4 bg-white/20 rounded-full">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>
        </div>
    );
};

export default function QuickActionsGrid() {
    const actions = [
        {
            title: 'Quản Lý Người Dùng',
            description: 'Thêm, sửa, xóa và phân quyền người dùng.',
            icon: <Users size={32} />,
            link: '/admin/users',
            colorClass: 'bg-gradient-to-br from-blue-500 to-indigo-600'
        },
        {
            title: 'Phê Duyệt Đăng Ký',
            description: 'Xem và phê duyệt các đăng ký hoạt động.',
            icon: <CheckCircle size={32} />,
            link: '/admin/approvals',
            colorClass: 'bg-gradient-to-br from-green-500 to-emerald-600'
        },
        {
            title: 'Báo Cáo & Thống Kê',
            description: 'Xem báo cáo chi tiết và thống kê hệ thống.',
            icon: <BarChart3 size={32} />,
            link: '/admin/reports',
            colorClass: 'bg-gradient-to-br from-purple-500 to-violet-600'
        },
        {
            title: 'Cài Đặt Hệ Thống',
            description: 'Cấu hình và tùy chỉnh các thông số hệ thống.',
            icon: <Settings size={32} />,
            link: '/admin/settings',
            colorClass: 'bg-gradient-to-br from-amber-500 to-orange-600'
        }
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thao Tác Nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {actions.map(action => (
                    <ActionCard key={action.title} {...action} />
                ))}
            </div>
        </div>
    );
}
