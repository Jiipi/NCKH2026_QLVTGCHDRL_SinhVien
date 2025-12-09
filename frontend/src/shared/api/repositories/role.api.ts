/**
 * Role API Repository
 * Data Layer - Handles role/permission API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';

export interface Role {
    id: string;
    ten_vt: string;
    mo_ta?: string;
    permissions: string[];
}

export interface CreateRoleDto {
    ten_vt: string;
    mo_ta?: string;
    permissions: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> { }

class RoleApi {
    async getRoles(): Promise<Role[]> {
        const response = await http.get(API_ENDPOINTS.roles.list);
        return response.data?.data || response.data;
    }

    async getRoleById(id: string): Promise<Role> {
        const response = await http.get(API_ENDPOINTS.roles.detail(id));
        return response.data?.data || response.data;
    }

    async createRole(data: CreateRoleDto): Promise<Role> {
        const response = await http.post(API_ENDPOINTS.roles.create, data);
        return response.data?.data || response.data;
    }

    async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
        const response = await http.put(API_ENDPOINTS.roles.update(id), data);
        return response.data?.data || response.data;
    }

    async deleteRole(id: string): Promise<void> {
        await http.delete(API_ENDPOINTS.roles.delete(id));
    }
}

export const roleApi = new RoleApi();
export default roleApi;
