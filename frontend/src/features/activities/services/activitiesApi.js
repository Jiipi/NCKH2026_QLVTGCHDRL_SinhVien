import http from '../../../shared/services/api/client';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[API Error]', { message, error });
  return { success: false, error: message, code: error.response?.status || null };
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
      return { success: true, data: response.data?.data || [] };
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
      const response = await http.post(`/core/registrations`, { hd_id: activityId });
      return { success: true, data: response.data?.data };
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
      const response = await http.post('/core/activities', activityData);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async updateActivity(activityId, activityData) {
    try {
      const response = await http.put(`/core/activities/${activityId}`, activityData);
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
      const response = await http.post(`/core/teacher/activities/${activityId}/approve`);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }

  async rejectActivity(activityId, reason) {
    try {
      const response = await http.post(`/core/teacher/activities/${activityId}/reject`, { reason });
      return { success: true, data: response.data?.data };
    } catch (error) {
      return handleError(error);
    }
  }
}

const activitiesApi = new ActivitiesAPI();
export default activitiesApi;
