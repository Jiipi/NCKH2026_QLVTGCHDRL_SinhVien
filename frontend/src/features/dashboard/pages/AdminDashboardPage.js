import React from 'react';

// Refactored imports
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import StatGrid from '../components/StatGrid';
import QuickActionsGrid from '../components/QuickActionsGrid';

// Shared components
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import ErrorMessage from '../../../shared/components/common/ErrorMessage';

// This is a placeholder for a more advanced recent activity feed
const RecentActivityFeed = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Hoạt Động Gần Đây</h3>
        <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">[Placeholder] Người dùng mới đăng ký.</div>
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">[Placeholder] Hoạt động cần phê duyệt.</div>
        </div>
    </div>
);

export default function AdminDashboardPage() {
    const { stats, loading, error } = useAdminDashboard();

    if (loading) {
        return <LoadingSpinner text="Đang tải dữ liệu dashboard..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản Trị</h1>
                <p className="text-gray-500 mt-1">Tổng quan nhanh về tình hình hoạt động của hệ thống.</p>
            </div>

            <StatGrid stats={stats} />

            <QuickActionsGrid />

            <RecentActivityFeed />
        </div>
    );
}
