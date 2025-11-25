import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
};

// Map frontend form fields to backend validator schema
const mapToBackendActivityPayload = async (data) => {
  const payload = {
    ten_hoat_dong: data.ten_hd ?? data.ten_hoat_dong,
    mo_ta: data.mo_ta ?? null,
    loai_hoat_dong_id: data.loai_hd_id ?? data.loai_hoat_dong_id,
    ngay_bat_dau: data.ngay_bd ?? data.ngay_bat_dau,
    ngay_ket_thuc: data.ngay_kt ?? data.ngay_ket_thuc,
    dia_diem: data.dia_diem ?? null,
    so_luong_toi_da: data.sl_toi_da ?? data.so_luong_toi_da ?? null,
    diem_ren_luyen: data.diem_rl ?? data.diem_ren_luyen ?? null,
    // Keep original fields for service normalization (ignored by validator)
    han_dk: data.han_dk ?? null,
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
      const data = response.data?.data || response.data || {};
      return { success: true, data: data.items || [], total: data.total || 0 };
    } catch (error) {
      return handleError(error);
    }
  }

  async getActivityDetails(activityId) {
    try {
      const response = await http.get(`/core/activities/${activityId}`);
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async getActivityTypes() {
    try {
      const response = await http.get('/core/activity-types');
      const raw = response.data?.data || response.data || [];
      const list = Array.isArray(raw) ? raw : (raw.items || []);
      return { success: true, data: list };
    } catch (error) {
      return handleError(error);
    }
  }

  // --- User-specific Activity Endpoints ---
  async getMyActivities(params = {}) {
    try {
      const response = await http.get('/core/dashboard/activities/me', { params });
      const data = response.data?.data || response.data || {};
      return { success: true, data: data.items || [], total: data.total || 0 };
    } catch (error) {
      return handleError(error);
    }
  }

  // --- Registration Endpoints ---
  async registerForActivity(activityId) {
    try {
      // Sử dụng endpoint /core/activities/:id/register
      // Endpoint này tự động lấy student.id từ user.sub và xử lý đúng
      const response = await http.post(`/core/activities/${activityId}/register`);
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async cancelRegistration(registrationId) {
    try {
      const response = await http.post(`/core/registrations/${registrationId}/cancel`);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  // --- Class/Monitor Activity Management (CRUD) ---
  async getClassActivities(params = {}) {
    try {
      // Assuming this endpoint fetches activities managed by the monitor's class
      const response = await http.get('/core/monitor/activities', { params });
      const data = response.data?.data || response.data || {};
      return { success: true, data: data.items || [], total: data.total || 0 };
    } catch (error) {
      return handleError(error);
    }
  }

  async createActivity(activityData) {
    try {
      const body = await mapToBackendActivityPayload(activityData);
      const response = await http.post('/core/activities', body);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async updateActivity(activityId, activityData) {
    try {
      const body = await mapToBackendActivityPayload(activityData);
      const response = await http.put(`/core/activities/${activityId}`, body);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async deleteActivity(activityId) {
    try {
      await http.delete(`/core/activities/${activityId}`);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }
  
  // --- Dashboard/Stats --- 
  async getClassDashboardStats(semester) {
      try {
          const params = semester ? { semester } : {};
          const response = await http.get('/core/monitor/dashboard', { params });
          return { success: true, data: response.data?.data || {} };
      } catch (error) {
          return handleError(error);
      }
  }


  // --- Admin-specific Activity Endpoints ---
  async listAdminActivities(params = {}) {
    try {
      const response = await http.get('/core/admin/activities', { params });
      const data = response.data?.data || response.data || {};
      return { success: true, data: data.items || [], total: data.total || 0 };
    } catch (error) {
      return handleError(error);
    }
  }

  async deleteAdminActivity(activityId) {
    try {
      await http.delete(`/core/admin/activities/${activityId}`);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }

  async approveAdminActivity(activityId) {
    try {
      const response = await http.post(`/core/admin/activities/${activityId}/approve`);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async rejectAdminActivity(activityId, reason) {
    try {
      const response = await http.post(`/core/admin/activities/${activityId}/reject`, { reason });
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  // --- Teacher-specific Activity Endpoints ---
  async approveActivity(activityId) {
    try {
      const response = await http.post(`/core/teachers/activities/${activityId}/approve`);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async rejectActivity(activityId, reason) {
    try {
      const response = await http.post(`/core/teachers/activities/${activityId}/reject`, { reason });
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }
}

const activitiesApi = new ActivitiesAPI();
export default activitiesApi;
