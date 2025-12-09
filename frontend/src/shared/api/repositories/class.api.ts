/**
 * Class API Repository
 * Data Layer - Handles class-related API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { Class, User, PaginatedResponse } from '../../types';

class ClassApi {
    async getClasses(): Promise<Class[]> {
        const response = await http.get(API_ENDPOINTS.classes.list);
        return response.data?.data || response.data;
    }

    async getClassById(id: string): Promise<Class> {
        const response = await http.get(API_ENDPOINTS.classes.detail(id));
        return response.data?.data || response.data;
    }

    async getClassStudents(id: string): Promise<User[]> {
        const response = await http.get(API_ENDPOINTS.classes.students(id));
        return response.data?.data || response.data;
    }
}

export const classApi = new ClassApi();
export default classApi;
