/**
 * Auth API Repository
 * Data Layer - Handles authentication API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { AuthUser } from '../../types';

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    ho_ten: string;
    ma_so?: string;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}

class AuthApi {
    async login(data: LoginDto): Promise<LoginResponse> {
        const response = await http.post(API_ENDPOINTS.auth.login, data);
        return response.data?.data || response.data;
    }

    async logout(): Promise<void> {
        await http.post(API_ENDPOINTS.auth.logout);
    }

    async register(data: RegisterDto): Promise<{ message: string }> {
        const response = await http.post(API_ENDPOINTS.auth.register, data);
        return response.data?.data || response.data;
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await http.post(API_ENDPOINTS.auth.forgotPassword, { email });
        return response.data?.data || response.data;
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        const response = await http.post(API_ENDPOINTS.auth.resetPassword, { token, password });
        return response.data?.data || response.data;
    }

    async getMe(): Promise<AuthUser> {
        const response = await http.get(API_ENDPOINTS.auth.me);
        return response.data?.data || response.data;
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
        const response = await http.post(API_ENDPOINTS.auth.changePassword, {
            oldPassword,
            newPassword,
        });
        return response.data?.data || response.data;
    }
}

export const authApi = new AuthApi();
export default authApi;
