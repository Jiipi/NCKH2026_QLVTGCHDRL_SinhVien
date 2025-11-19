import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Settings,
  CheckCircle, 
  AlertCircle, 
  Bell,
  Activity,
  UserCheck,
  ShieldCheck,
  FileText
} from 'lucide-react';

import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { 
  MobileOptimizedStatCard, 
  MobileOptimizedActionCard, 
  MobileOptimizedGrid,
  MobileOptimizedHeader,
  MobileOptimizedSection,
  MobileOptimizedEmptyState
} from '../../../components/MobileOptimizedDashboard';

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { stats, loading, error, refresh: loadDashboardData } = useAdminDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={loadDashboardData}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <MobileOptimizedHeader
                title="Dashboard Quản trị"
                subtitle="Tổng quan nhanh về tình hình hoạt động của hệ thống."
                badge={new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
            />

            <MobileOptimizedGrid type="stats">
                <MobileOptimizedStatCard
                    title="Tổng người dùng"
                    value={stats.totalUsers}
                    icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                    color="blue"
                    subtitle="Tất cả các vai trò"
                    onClick={() => navigate('/admin/users')}
                />
                <MobileOptimizedStatCard
                    title="Tổng hoạt động"
                    value={stats.totalActivities}
                    icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
                    color="purple"
                    subtitle="Trong toàn hệ thống"
                    onClick={() => navigate('/admin/activities')}
                />
                <MobileOptimizedStatCard
                    title="Hoạt động chờ duyệt"
                    value={stats.pendingActivities}
                    icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                    color="orange"
                    subtitle="Cần xem xét ngay"
                    onClick={() => navigate('/admin/approvals')}
                />
                <MobileOptimizedStatCard
                    title="Lớp học"
                    value={stats.totalClasses}
                    icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
                    color="green"
                    subtitle="Đang hoạt động"
                    onClick={() => navigate('/admin/classes')}
                />
            </MobileOptimizedGrid>

            <MobileOptimizedSection title="Thao tác nhanh">
                <MobileOptimizedGrid type="actions">
                    <MobileOptimizedActionCard
                        title="Quản lý người dùng"
                        description="Thêm, sửa, xóa và phân quyền người dùng"
                        icon={<UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
                        color="blue"
                        onClick={() => navigate('/admin/users')}
                    />
                    <MobileOptimizedActionCard
                        title="Phê duyệt hoạt động"
                        description="Xem và phê duyệt các hoạt động mới"
                        icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
                        color="green"
                        badge={stats.pendingActivities > 0 ? stats.pendingActivities : null}
                        onClick={() => navigate('/admin/approvals')}
                    />
                    <MobileOptimizedActionCard
                        title="Quản lý học kỳ"
                        description="Tạo và quản lý các học kỳ trong năm"
                        icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
                        color="purple"
                        onClick={() => navigate('/admin/semesters')}
                    />
                    <MobileOptimizedActionCard
                        title="Báo cáo & Thống kê"
                        description="Xuất báo cáo và xem thống kê chi tiết"
                        icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />}
                        color="orange"
                        onClick={() => navigate('/admin/reports')}
                    />
                </MobileOptimizedGrid>
            </MobileOptimizedSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6">
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
                    <MobileOptimizedEmptyState
                        icon={<FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />}
                        title="Tính năng đang phát triển"
                        message="Nhật ký hoạt động chi tiết sẽ sớm được hiển thị ở đây."
                    />
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Thông báo hệ thống</h2>
                    <MobileOptimizedEmptyState
                        icon={<Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />}
                        title="Chưa có thông báo"
                        message="Tạo thông báo mới để gửi đến toàn bộ người dùng."
                    />
                </div>
            </div>
        </div>
    );
}