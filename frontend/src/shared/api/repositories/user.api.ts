/**
 * User API Repository
 * Data Layer - Handles all user-related API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { User, PaginatedResponse, PaginationParams } from '../../types';

export interface GetUsersParams extends PaginationParams {
    search?: string;
    role?: string;
    classId?: string;
    isActive?: boolean;
}

export interface CreateUserDto {
    email: string;
    password: string;
    ho_ten: string;
    ma_so?: string;
    vai_tro_id: string;
    lop_id?: string;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
    is_active?: boolean;
}

class UserApi {
    /**
     * Lấy danh sách users (Admin)
     */
    async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
        const response = await http.get(API_ENDPOINTS.users.list, { params });
        return response.data?.data || response.data;
    }

    /**
     * Lấy chi tiết user
     */
    async getUserById(id: string): Promise<User> {
        const response = await http.get(API_ENDPOINTS.users.detail(id));
        return response.data?.data || response.data;
    }

    /**
     * Tạo user mới (Admin)
     */
    async createUser(data: CreateUserDto): Promise<User> {
        const response = await http.post(API_ENDPOINTS.users.create, data);
        return response.data?.data || response.data;
    }

    /**
     * Cập nhật user (Admin)
     */
    async updateUser(id: string, data: UpdateUserDto): Promise<User> {
        const response = await http.put(API_ENDPOINTS.users.update(id), data);
        return response.data?.data || response.data;
    }

    /**
     * Xóa user (Admin)
     */
    async deleteUser(id: string): Promise<void> {
        await http.delete(API_ENDPOINTS.users.delete(id));
    }

    /**
     * Lấy profile người dùng hiện tại
     */
    async getProfile(): Promise<User> {
        const response = await http.get(API_ENDPOINTS.users.profile);
        return response.data?.data || response.data;
    }

    /**
     * Lấy điểm của user
     */
    async getUserPoints(id: string): Promise<{ totalPoints: number; details: unknown[] }> {
        const response = await http.get(API_ENDPOINTS.users.points(id));
        return response.data?.data || response.data;
    }
}

export const userApi = new UserApi();
export default userApi;
