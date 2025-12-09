/**
 * Points API Repository
 * Data Layer - Handles points/scores API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { StudentPoints } from '../../types';

class PointsApi {
    async getStudentPoints(): Promise<StudentPoints> {
        const response = await http.get(API_ENDPOINTS.points.student);
        return response.data?.data || response.data;
    }

    async getClassPoints(classId: string): Promise<{ students: Array<{ userId: string; name: string; points: number }> }> {
        const response = await http.get(API_ENDPOINTS.points.class(classId));
        return response.data?.data || response.data;
    }

    async calculatePoints(): Promise<{ message: string }> {
        const response = await http.post(API_ENDPOINTS.points.calculate);
        return response.data?.data || response.data;
    }
}

export const pointsApi = new PointsApi();
export default pointsApi;
