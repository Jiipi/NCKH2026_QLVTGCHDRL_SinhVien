/**
 * Notification API Repository
 * Data Layer - Handles notification API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { Notification, PaginatedResponse, PaginationParams } from '../../types';

export interface CreateNotificationDto {
    tieu_de: string;
    noi_dung: string;
    loai?: string;
    nguoi_nhan_ids?: string[];
}

class NotificationApi {
    async getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
        const response = await http.get(API_ENDPOINTS.notifications.list, { params });
        return response.data?.data || response.data;
    }

    async getNotificationById(id: string): Promise<Notification> {
        const response = await http.get(API_ENDPOINTS.notifications.detail(id));
        return response.data?.data || response.data;
    }

    async markAsRead(id: string): Promise<void> {
        await http.post(API_ENDPOINTS.notifications.markRead(id));
    }

    async markAllAsRead(): Promise<void> {
        await http.post(API_ENDPOINTS.notifications.markAllRead);
    }

    async createNotification(data: CreateNotificationDto): Promise<Notification> {
        const response = await http.post(API_ENDPOINTS.notifications.create, data);
        return response.data?.data || response.data;
    }

    async broadcast(data: CreateNotificationDto): Promise<{ sent: number }> {
        const response = await http.post(API_ENDPOINTS.notifications.broadcast, data);
        return response.data?.data || response.data;
    }
}

export const notificationApi = new NotificationApi();
export default notificationApi;
