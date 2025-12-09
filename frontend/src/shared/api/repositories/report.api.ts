/**
 * Report API Repository
 * Data Layer - Handles report and export API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';

export interface ReportOverview {
    totalUsers: number;
    totalActivities: number;
    totalRegistrations: number;
    completionRate: number;
}

export interface ClassReport {
    classId: string;
    className: string;
    studentCount: number;
    totalPoints: number;
    averagePoints: number;
}

class ReportApi {
    async getOverview(): Promise<ReportOverview> {
        const response = await http.get(API_ENDPOINTS.reports.overview);
        return response.data?.data || response.data;
    }

    async getClassReports(): Promise<ClassReport[]> {
        const response = await http.get(API_ENDPOINTS.reports.classes);
        return response.data?.data || response.data;
    }

    async getAttendanceReport(activityId?: string): Promise<unknown> {
        const response = await http.get(API_ENDPOINTS.reports.attendance, {
            params: { activityId },
        });
        return response.data?.data || response.data;
    }

    async exportActivities(params?: { semester?: string; format?: 'xlsx' | 'csv' }): Promise<Blob> {
        const response = await http.get(API_ENDPOINTS.reports.export.activities, {
            params,
            responseType: 'blob',
        });
        return response.data;
    }

    async exportRegistrations(params?: { activityId?: string; format?: 'xlsx' | 'csv' }): Promise<Blob> {
        const response = await http.get(API_ENDPOINTS.reports.export.registrations, {
            params,
            responseType: 'blob',
        });
        return response.data;
    }
}

export const reportApi = new ReportApi();
export default reportApi;
