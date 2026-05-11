import http from '../../../shared/api/http';

export type MonitorFaceAttendanceMarked = {
  studentId: string;
  mssv: string;
  hoTen: string;
  attendanceId: string;
  similarity: number;
  sourceImageIndex: number;
};

export type MonitorFaceAttendanceSkipped = {
  sourceImageIndex: number;
  reason: string;
  studentId?: string;
  mssv?: string;
  hoTen?: string;
  similarity?: number;
};

export type MonitorFaceAttendanceResult = {
  success: boolean;
  activityId: string;
  activityName: string;
  totalImages: number;
  marked: MonitorFaceAttendanceMarked[];
  skipped: MonitorFaceAttendanceSkipped[];
};

const getErrorMessage = (error: unknown) => {
  const apiError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
  return apiError.response?.data?.message || apiError.response?.data?.error || apiError.message || 'Không thể điểm danh khuôn mặt.';
};

export const monitorFaceAttendanceApi = {
  async bulkFaceAttendance(activityId: string, files: File[]) {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await http.post(`/face/monitor/attendance/${activityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return {
        success: true,
        data: (response.data?.data ?? response.data) as MonitorFaceAttendanceResult
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        data: null
      };
    }
  }
};

export default monitorFaceAttendanceApi;
