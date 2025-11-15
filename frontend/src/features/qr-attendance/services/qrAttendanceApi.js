import apiClient from '../../../shared/services/api/client';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Điểm danh thất bại. Vui lòng thử lại.';
  const code = error.response?.status || null;
  console.error('[QR Attendance API Error]', { message, code, error });
  return { success: false, error: message, code };
};

class QRAttendanceAPI {
  /**
   * Submits a scanned QR code to the backend for attendance processing.
   * @param {string} qrData - The raw data string from the QR code.
   * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
   */
  async submitQR(qrData) {
    try {
      const response = await apiClient.post('/activities/attendance/scan', {
        qr_code: qrData,
      });
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message || 'Điểm danh thành công!',
      };
    } catch (error) {
      return handleError(error);
    }
  }
}

const qrAttendanceApi = new QRAttendanceAPI();
export default qrAttendanceApi;

