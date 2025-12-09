/**
 * QR Attendance API Repository
 * Data Layer - Handles QR attendance API calls
 */

import http from '../http';
import { API_ENDPOINTS } from '../endpoints';

export interface QRCodeData {
    qrCode: string;
    expiresAt: string;
    activityId: string;
}

export interface AttendanceRecord {
    studentId: string;
    studentName: string;
    attendedAt: string;
}

class QRApi {
    async generateQRCode(activityId: string): Promise<QRCodeData> {
        const response = await http.post(API_ENDPOINTS.qr.generate(activityId));
        return response.data?.data || response.data;
    }

    async scanQRCode(qrData: string): Promise<{ success: boolean; message: string }> {
        const response = await http.post(API_ENDPOINTS.qr.scan, { qrData });
        return response.data?.data || response.data;
    }

    async getAttendance(activityId: string): Promise<AttendanceRecord[]> {
        const response = await http.get(API_ENDPOINTS.qr.attendance(activityId));
        return response.data?.data || response.data;
    }
}

export const qrApi = new QRApi();
export default qrApi;
