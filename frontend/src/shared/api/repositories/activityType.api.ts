/**
 * Activity Types API Repository
 * Data Layer - Handles activity type API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { ActivityType } from '../../types';

export interface CreateActivityTypeDto {
    ten_loai: string;
    mo_ta?: string;
    diem_toi_da?: number;
}

export interface UpdateActivityTypeDto extends Partial<CreateActivityTypeDto> {
    is_active?: boolean;
}

class ActivityTypeApi {
    async getActivityTypes(): Promise<ActivityType[]> {
        const response = await http.get(API_ENDPOINTS.activityTypes.list);
        return response.data?.data || response.data;
    }

    async getActivityTypeById(id: string): Promise<ActivityType> {
        const response = await http.get(API_ENDPOINTS.activityTypes.detail(id));
        return response.data?.data || response.data;
    }

    async createActivityType(data: CreateActivityTypeDto): Promise<ActivityType> {
        const response = await http.post(API_ENDPOINTS.activityTypes.create, data);
        return response.data?.data || response.data;
    }

    async updateActivityType(id: string, data: UpdateActivityTypeDto): Promise<ActivityType> {
        const response = await http.put(API_ENDPOINTS.activityTypes.update(id), data);
        return response.data?.data || response.data;
    }

    async deleteActivityType(id: string): Promise<void> {
        await http.delete(API_ENDPOINTS.activityTypes.delete(id));
    }
}

export const activityTypeApi = new ActivityTypeApi();
export default activityTypeApi;
