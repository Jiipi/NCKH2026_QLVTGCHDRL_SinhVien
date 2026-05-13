import http from '../../../shared/api/http';
import { getFingerprintAssertion } from '../../../shared/lib/webauthn';

interface QRErrorResponse {
  success: false;
  error: string;
  code: number | null;
  details?: unknown;
}

interface AttendanceLocationPayload {
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
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
  const details = error?.response?.data?.errors || null;
  try { console.error('[QR Attendance API Error]', { message, code, details, error }); } catch (_) {}
  return { success: false, error: message, code, details };
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

  async scanAttendance(activityId: string, token: string, sessionId?: string, location?: AttendanceLocationPayload | null): Promise<QRResponse<any>> {
    try {
      const res = await http.post(`/activities/${activityId}/attendance/scan`, { token, sessionId, location });
      return {
        success: true,
        data: res?.data?.data || res?.data || {},
        message: res?.data?.message || 'Điểm danh thành công!'
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async scanFingerprintAttendance(activityId: string, location?: AttendanceLocationPayload | null): Promise<QRResponse<any>> {
    try {
      const optionsRes = await http.post(`/activities/${activityId}/attendance/van-tay/options`);
      const options = optionsRes?.data?.data || optionsRes?.data || {};
      const credential = await getFingerprintAssertion(options);
      const res = await http.post(`/activities/${activityId}/attendance/van-tay/verify`, { credential, location });
      return {
        success: true,
        data: res?.data?.data || res?.data || {},
        message: res?.data?.message || 'Điểm danh vân tay thành công!'
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

