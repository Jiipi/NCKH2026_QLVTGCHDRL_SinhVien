import apiClient from '../../../shared/services/api/client';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  console.error('[Dashboard API Error]', { message, error });
  return { success: false, error: message };
};

class DashboardAPI {
  /**
   * Fetches all necessary data for the student dashboard.
   * @param {string} semester - The semester to filter data by.
   * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
   */
  async getStudentDashboard(semester) {
    try {
      const response = await apiClient.get('/core/dashboard/student', { params: { semesterValue: semester } });
      return { success: true, data: response.data?.data || {} };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Fetches data for the class monitor's dashboard.
   * @param {string} semester - The semester to filter data by.
   * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
   */
  async getClassDashboard(semester) {
    try {
      const response = await apiClient.get('/core/monitor/dashboard', { params: { semester } });
      return { success: true, data: response.data?.data || {} };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Fetches data for the teacher's dashboard.
   * @param {string} semester - The semester to filter data by.
   * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
   */
  async getTeacherDashboard(semester) {
    try {
      const response = await apiClient.get('/teacher/dashboard', { params: { semester } });
      return { success: true, data: response.data?.data || {} };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Fetches data for the admin dashboard.
   * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
   */
  async getAdminDashboard() {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return { success: true, data: response.data?.data || {} };
    } catch (error) {
      return handleError(error);
    }
  }
}

const dashboardApi = new DashboardAPI();
export default dashboardApi;

