import http from '../../../shared/api/http';

export type StudentPointsParams = {
  semester?: string;
  hoc_ky?: string;
  nam_hoc?: string;
};

export const studentPointsApi = {
  async getSummary(params: StudentPointsParams) {
    const response = await http.get('/core/points/summary', { params });
    return response?.data?.data || response?.data;
  },

  async getDetail(params: StudentPointsParams) {
    const response = await http.get('/core/points/detail', { params });
    return response?.data?.data?.data || response?.data?.data || [];
  },

  async getAttendanceHistory(params: StudentPointsParams) {
    const response = await http.get('/core/points/attendance-history', { params });
    return response?.data?.data?.data || response?.data?.data || [];
  },

  async downloadReport(params: StudentPointsParams) {
    const response = await http.get('/core/points/report', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
