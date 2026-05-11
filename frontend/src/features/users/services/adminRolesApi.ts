import http from '../../../shared/api/http';
import { extractRolesFromAxiosResponse } from '../../../shared/lib/apiNormalization';
import { userManagementApi } from '../../admin/services/userManagementApi';

export interface RoleData {
  id: string;
  ten_vt: string;
  mo_ta?: string;
  quyen_han?: string[];
  [key: string]: unknown;
}

export interface UserData {
  id: string;
  ten_dn?: string;
  ho_ten?: string;
  email?: string;
  trang_thai?: string;
  khoa?: boolean;
  mssv?: string;
  vai_tro?: { id?: string; ten_vt: string };
  sinh_vien?: { mssv?: string; lop?: { ten_lop?: string } };
  [key: string]: unknown;
}

export interface PaginationInfo {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface UsersResponseData {
  pagination?: PaginationInfo;
  users?: UserData[];
  total?: number;
}

export interface RolePayload {
  ten_vt: string;
  mo_ta?: string;
  quyen_han: string[];
}

interface ActiveSessionUser {
  user_id?: string;
  ten_dn?: string;
  mssv?: string;
}

interface ActiveSessionsData {
  userIds?: Array<string | number | null | undefined>;
  userCodes?: Array<string | number | null | undefined>;
  users?: ActiveSessionUser[];
}

function extractActiveUserIds(data: ActiveSessionsData | undefined) {
  const activeIds = new Set<string>();
  if (!data) return activeIds;

  if (Array.isArray(data.userIds)) {
    data.userIds.forEach((id) => {
      if (id != null) activeIds.add(String(id));
    });
  }

  if (Array.isArray(data.userCodes)) {
    data.userCodes.forEach((code) => {
      if (code) activeIds.add(String(code));
    });
  }

  if (Array.isArray(data.users)) {
    data.users.forEach((user) => {
      if (user?.user_id) activeIds.add(String(user.user_id));
      if (user?.ten_dn) activeIds.add(String(user.ten_dn));
      if (user?.mssv) activeIds.add(String(user.mssv));
    });
  }

  return activeIds;
}

export const adminRolesApi = {
  async getActiveUserIds(minutes = 5) {
    const response = await http.get(`/core/sessions/active-users?minutes=${minutes}`);
    return extractActiveUserIds(response.data?.data as ActiveSessionsData | undefined);
  },

  async getRoles() {
    return extractRolesFromAxiosResponse(await http.get('/admin/roles')) as unknown as RoleData[];
  },

  async getRoleDetail(roleId: string) {
    const response = await http.get(`/admin/roles/${roleId}`);
    const data = response?.data?.data || response?.data || {};
    if (!Array.isArray(data.quyen_han)) data.quyen_han = [];
    return data as RoleData;
  },

  async updateRole(roleId: string, payload: RolePayload) {
    await http.put(`/admin/roles/${roleId}`, payload);
  },

  async deleteRole(roleId: string) {
    await http.delete(`/admin/roles/${roleId}`, { params: { cascadeUsers: true } });
  },

  async fetchUsers(params: { page?: number; limit?: number; role?: string; search?: string }) {
    return userManagementApi.fetchUsers(params);
  }
};
