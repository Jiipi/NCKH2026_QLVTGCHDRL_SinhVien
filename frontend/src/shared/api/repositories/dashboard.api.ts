/**
 * Dashboard API Repository
 * Data Layer - Handles dashboard data for all roles
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { DashboardStats, Activity } from '../../types';

export interface StudentDashboard extends DashboardStats {
    upcomingActivities: Activity[];
    recentActivities: Activity[];
    myRegistrations: Activity[];
}

export interface TeacherDashboard extends DashboardStats {
    pendingApprovals: number;
    recentActivities: Activity[];
    classStats?: {
        classId: string;
        className: string;
        studentCount: number;
    }[];
}

export interface MonitorDashboard extends DashboardStats {
    classActivities: Activity[];
    classPendingApprovals: number;
}

export interface AdminDashboard extends DashboardStats {
    userStats: {
        total: number;
        byRole: { role: string; count: number }[];
    };
    activityStats: {
        total: number;
        byStatus: { status: string; count: number }[];
    };
}

class DashboardApi {
    async getStudentDashboard(): Promise<StudentDashboard> {
        const response = await http.get(API_ENDPOINTS.dashboard.student);
        return response.data?.data || response.data;
    }

    async getTeacherDashboard(): Promise<TeacherDashboard> {
        const response = await http.get(API_ENDPOINTS.dashboard.teacher);
        return response.data?.data || response.data;
    }

    async getMonitorDashboard(): Promise<MonitorDashboard> {
        const response = await http.get(API_ENDPOINTS.dashboard.monitor);
        return response.data?.data || response.data;
    }

    async getAdminDashboard(): Promise<AdminDashboard> {
        const response = await http.get(API_ENDPOINTS.dashboard.admin);
        return response.data?.data || response.data;
    }
}

export const dashboardApi = new DashboardApi();
export default dashboardApi;
