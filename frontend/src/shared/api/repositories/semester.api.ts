/**
 * Semester API Repository
 * Data Layer - Handles semester API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';
import type { Semester } from '../../types';

class SemesterApi {
    async getSemesters(): Promise<Semester[]> {
        const response = await http.get(API_ENDPOINTS.semesters.list);
        return response.data?.data || response.data;
    }

    async getActiveSemester(): Promise<Semester | null> {
        const response = await http.get(API_ENDPOINTS.semesters.active);
        return response.data?.data || response.data;
    }

    async activateSemester(id: string): Promise<Semester> {
        const response = await http.post(API_ENDPOINTS.semesters.activate(id));
        return response.data?.data || response.data;
    }

    async lockSemester(id: string): Promise<Semester> {
        const response = await http.post(API_ENDPOINTS.semesters.lock(id));
        return response.data?.data || response.data;
    }

    async unlockSemester(id: string): Promise<Semester> {
        const response = await http.post(API_ENDPOINTS.semesters.unlock(id));
        return response.data?.data || response.data;
    }
}

export const semesterApi = new SemesterApi();
export default semesterApi;
