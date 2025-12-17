import http from '../../../shared/api/http';

interface QRErrorResponse {
  success: false;
  error: string;
  code: number | null;
}

interface QRSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

type QRResponse<T = unknown> = QRSuccessResponse<T> | QRErrorResponse;

const handleError = (error: any): QRErrorResponse => {
  const message = error?.response?.data?.message || error?.message || 'Điểm danh thất bại. Vui lòng thử lại.';
  const code = error?.response?.status || null;
  try { console.error('[QR Attendance API Error]', { message, code, error }); } catch (_) {}
  return { success: false, error: message, code };
};

class QRAttendanceAPI {
  // Legacy flow helpers
  async getQrData(activityId: string): Promise<QRResponse<any>> {
    try {
      const res = await http.get(`/activities/${activityId}/qr-data`);
      // backend may return {data:{qr_token, activity_name}} or flat
      const data = res?.data?.data || res?.data || {};
      return { success: true, data };
    } catch (error) {
      return handleError(error);
    }
  }

  async scanAttendance(activityId: string, token: string): Promise<QRResponse<any>> {
    try {
      const res = await http.post(`/activities/${activityId}/attendance/scan`, { token });
      return {
        success: true,
        data: res?.data?.data || res?.data || {},
        message: res?.data?.message || 'Điểm danh thành công!'
      };
    } catch (error) {
      return handleError(error);
    }
  }

  // Optional: raw QR submit (non-legacy simple flow)
  async submitRawQRCode(qrData: string): Promise<QRResponse<any>> {
    try {
      const res = await http.post('/activities/attendance/scan', { qr_code: qrData });
      return {
        success: true,
        data: res?.data?.data || res?.data || {},
        message: res?.data?.message || 'Điểm danh thành công!'
      };
    } catch (error) {
      return handleError(error);
    }
  }
}

const qrAttendanceApi = new QRAttendanceAPI();
export default qrAttendanceApi;

