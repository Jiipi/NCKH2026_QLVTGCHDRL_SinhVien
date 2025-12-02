import http from '../../../shared/api/http';
import { 
  handleApiError, 
  createSuccessResponse, 
  extractApiData, 
  extractPaginatedData,
  extractArrayData 
} from './apiErrorHandler';
import { emitActivitiesChange } from '../../../shared/lib/dataRefresh';
import { toISOWithTimezone } from '../../../shared/lib/dateTime';

// Map frontend form fields to backend validator schema
const mapToBackendActivityPayload = async (data) => {
  const payload = {
    ten_hoat_dong: data.ten_hd ?? data.ten_hoat_dong,
    mo_ta: data.mo_ta ?? null,
    loai_hoat_dong_id: data.loai_hd_id ?? data.loai_hoat_dong_id,
    // Chuyển đổi datetime sang ISO format với timezone để backend parse đúng
    ngay_bat_dau: toISOWithTimezone(data.ngay_bd ?? data.ngay_bat_dau),
    ngay_ket_thuc: toISOWithTimezone(data.ngay_kt ?? data.ngay_ket_thuc),
    dia_diem: data.dia_diem ?? null,
    so_luong_toi_da: data.sl_toi_da ?? data.so_luong_toi_da ?? null,
    diem_ren_luyen: data.diem_rl ?? data.diem_ren_luyen ?? null,
    // Keep original fields for service normalization (ignored by validator)
    han_dk: toISOWithTimezone(data.han_dk),
    hoc_ky: data.hoc_ky,
    nam_hoc: data.nam_hoc,
  };

  // Attach scope fields based on current user's role (monitor => class scope)
  try {
    let res;
    try {
      res = await http.get('/core/profile');
    } catch (err) {
      res = await http.get('/auth/profile');
    }
    const profile = res?.data?.data || res?.data || {};
    const role = (profile.role || profile?.vai_tro?.ten_vt || '').toString().toUpperCase();

    if (role === 'LOP_TRUONG') {
      payload.pham_vi = 'lop';
      const lopId = profile?.sinh_vien?.lop_id || profile?.lop_id || null;
      if (lopId) payload.lop_id = lopId;
    } else {
      // Default safe scope to satisfy validator without requiring khoa_id
      payload.pham_vi = payload.pham_vi || 'toan_truong';
    }
  } catch (_) {
    // If profile fetch fails, default to system-wide scope to pass validator
    payload.pham_vi = payload.pham_vi || 'toan_truong';
  }

  return payload;
};

class ActivitiesAPI {
  // --- Generic Activity Endpoints ---
  async listActivities(params = {}) {
    try {
      const response = await http.get('/core/activities', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getActivityDetails(activityId) {
    try {
      const response = await http.get(`/core/activities/${activityId}`);
      return createSuccessResponse(extractApiData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getActivityTypes() {
    try {
      const response = await http.get('/core/activity-types');
      return createSuccessResponse(extractArrayData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- User-specific Activity Endpoints ---
  async getMyActivities(params = {}) {
    try {
      const response = await http.get('/core/dashboard/activities/me', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Registration Endpoints ---
  async registerForActivity(activityId) {
    try {
      const response = await http.post(`/core/activities/${activityId}/register`);
      return createSuccessResponse(extractApiData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }

  async cancelRegistration(registrationId) {
    try {
      const response = await http.post(`/core/registrations/${registrationId}/cancel`);
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Class/Monitor Activity Management (CRUD) ---
  async getClassActivities(params = {}) {
    try {
      const response = await http.get('/core/monitor/activities', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async createActivity(activityData) {
    try {
      const body = await mapToBackendActivityPayload(activityData);
      const response = await http.post('/core/activities', body);
      emitActivitiesChange({ action: 'create' });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async updateActivity(activityId, activityData) {
    try {
      const body = await mapToBackendActivityPayload(activityData);
      const response = await http.put(`/core/activities/${activityId}`, body);
      emitActivitiesChange({ action: 'update', id: activityId });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async deleteActivity(activityId) {
    try {
      await http.delete(`/core/activities/${activityId}`);
      emitActivitiesChange({ action: 'delete', id: activityId });
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }
  
  // --- Dashboard/Stats --- 
  async getClassDashboardStats(semester) {
    try {
      const params = semester ? { semester } : {};
      const response = await http.get('/core/monitor/dashboard', { params });
      return createSuccessResponse(extractApiData(response));
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Admin-specific Activity Endpoints ---
  async listAdminActivities(params = {}) {
    try {
      const response = await http.get('/core/admin/activities', { params });
      const { items, total } = extractPaginatedData(response);
      return createSuccessResponse(items, total);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async deleteAdminActivity(activityId) {
    try {
      await http.delete(`/core/admin/activities/${activityId}`);
      emitActivitiesChange({ action: 'delete', id: activityId });
      return createSuccessResponse(null);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async approveAdminActivity(activityId) {
    try {
      const response = await http.post(`/core/admin/activities/${activityId}/approve`);
      emitActivitiesChange({ action: 'approve', id: activityId });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async rejectAdminActivity(activityId, reason) {
    try {
      const response = await http.post(`/core/admin/activities/${activityId}/reject`, { reason });
      emitActivitiesChange({ action: 'reject', id: activityId });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  // --- Teacher-specific Activity Endpoints ---
  async approveActivity(activityId) {
    try {
      const response = await http.post(`/core/teachers/activities/${activityId}/approve`);
      emitActivitiesChange({ action: 'approve', id: activityId });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async rejectActivity(activityId, reason) {
    try {
      const response = await http.post(`/core/teachers/activities/${activityId}/reject`, { reason });
      emitActivitiesChange({ action: 'reject', id: activityId });
      return createSuccessResponse(response.data?.data);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

const activitiesApi = new ActivitiesAPI();
export default activitiesApi;
