/**
 * Registration API Repository
 * Data Layer - Handles all registration-related API calls
 * DÙNG CHUNG cho: Admin, Teacher, Student, Monitor
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type {
    Registration,
    PaginatedResponse,
    PaginationParams,
    ApproveRegistrationDto,
    RejectRegistrationDto,
} from '../../types';

export interface GetRegistrationsParams extends PaginationParams {
    activityId?: string;
    studentId?: string;
    status?: string;
    classId?: string;
}

class RegistrationApi {
    /**
     * Lấy danh sách đăng ký (Admin)
     */
    async getRegistrations(params?: GetRegistrationsParams): Promise<PaginatedResponse<Registration>> {
        const response = await http.get(API_ENDPOINTS.registrations.list, { params });
        return response.data?.data || response.data;
    }

    /**
     * Lấy chi tiết đăng ký
     */
    async getRegistrationById(id: string): Promise<Registration> {
        const response = await http.get(API_ENDPOINTS.registrations.detail(id));
        return response.data?.data || response.data;
    }

    /**
     * Duyệt đăng ký
     * Roles: Admin, Teacher, Monitor (class)
     */
    async approveRegistration(id: string, data?: ApproveRegistrationDto): Promise<Registration> {
        const response = await http.post(API_ENDPOINTS.registrations.approve(id), data);
        return response.data?.data || response.data;
    }

    /**
     * Từ chối đăng ký
     * Roles: Admin, Teacher, Monitor (class)
     */
    async rejectRegistration(id: string, data: RejectRegistrationDto): Promise<Registration> {
        const response = await http.post(API_ENDPOINTS.registrations.reject(id), data);
        return response.data?.data || response.data;
    }

    /**
     * Duyệt/từ chối hàng loạt
     * Roles: Admin, Teacher
     */
    async bulkUpdateRegistrations(
        ids: string[],
        action: 'approve' | 'reject',
        reason?: string
    ): Promise<{ success: number; failed: number }> {
        const response = await http.post(API_ENDPOINTS.registrations.bulk, {
            ids,
            action,
            reason,
        });
        return response.data?.data || response.data;
    }

    /**
     * Lấy đăng ký của sinh viên hiện tại
     * Roles: Student, Monitor
     */
    async getMyRegistrations(params?: PaginationParams): Promise<PaginatedResponse<Registration>> {
        const response = await http.get(API_ENDPOINTS.registrations.myRegistrations, { params });
        return response.data?.data || response.data;
    }
}

export const registrationApi = new RegistrationApi();
export default registrationApi;
