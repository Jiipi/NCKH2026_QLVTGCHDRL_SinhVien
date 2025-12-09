/**
 * Activity API Repository
 * Data Layer - Handles all activity-related API calls
 * DÙNG CHUNG cho: Admin, Teacher, Student, Monitor
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type {
    Activity,
    GetActivitiesParams,
    CreateActivityDto,
    UpdateActivityDto,
    PaginatedResponse,
} from '../../types';

class ActivityApi {
    /**
     * Lấy danh sách hoạt động - DÙNG CHUNG
     * Roles: All authenticated users
     */
    async getActivities(params?: GetActivitiesParams): Promise<PaginatedResponse<Activity>> {
        const response = await http.get(API_ENDPOINTS.activities.list, { params });
        return response.data?.data || response.data;
    }

    /**
     * Lấy chi tiết hoạt động theo ID
     * Roles: All authenticated users
     */
    async getActivityById(id: string): Promise<Activity> {
        const response = await http.get(API_ENDPOINTS.activities.detail(id));
        return response.data?.data || response.data;
    }

    /**
     * Tạo hoạt động mới
     * Roles: Admin, Teacher, Monitor
     */
    async createActivity(data: CreateActivityDto): Promise<Activity> {
        const response = await http.post(API_ENDPOINTS.activities.create, data);
        return response.data?.data || response.data;
    }

    /**
     * Cập nhật hoạt động
     * Roles: Admin, Owner (Teacher/Monitor who created)
     */
    async updateActivity(id: string, data: UpdateActivityDto): Promise<Activity> {
        const response = await http.put(API_ENDPOINTS.activities.update(id), data);
        return response.data?.data || response.data;
    }

    /**
     * Xóa hoạt động
     * Roles: Admin, Owner
     */
    async deleteActivity(id: string): Promise<void> {
        await http.delete(API_ENDPOINTS.activities.delete(id));
    }

    /**
     * Duyệt hoạt động
     * Roles: Admin, Teacher
     */
    async approveActivity(id: string, note?: string): Promise<Activity> {
        const response = await http.post(API_ENDPOINTS.activities.approve(id), { note });
        return response.data?.data || response.data;
    }

    /**
     * Từ chối hoạt động
     * Roles: Admin, Teacher
     */
    async rejectActivity(id: string, reason: string): Promise<Activity> {
        const response = await http.post(API_ENDPOINTS.activities.reject(id), { reason });
        return response.data?.data || response.data;
    }

    /**
     * Đăng ký tham gia hoạt động
     * Roles: Student, Monitor
     */
    async registerActivity(id: string): Promise<void> {
        await http.post(API_ENDPOINTS.activities.register(id));
    }

    /**
     * Hủy đăng ký hoạt động
     * Roles: Student, Monitor (before deadline)
     */
    async cancelRegistration(id: string): Promise<void> {
        await http.post(API_ENDPOINTS.activities.cancelRegistration(id));
    }

    /**
     * Lấy dữ liệu QR cho điểm danh
     * Roles: Admin, Teacher, Monitor
     */
    async getQRData(id: string): Promise<{ qrCode: string; expiresAt: string }> {
        const response = await http.get(API_ENDPOINTS.activities.qrData(id));
        return response.data?.data || response.data;
    }

    /**
     * Quét điểm danh qua QR
     * Roles: Student, Monitor
     */
    async scanAttendance(qrData: string): Promise<{ success: boolean; message: string }> {
        const response = await http.post(API_ENDPOINTS.activities.scanAttendance, { qrData });
        return response.data?.data || response.data;
    }
}

export const activityApi = new ActivityApi();
export default activityApi;
