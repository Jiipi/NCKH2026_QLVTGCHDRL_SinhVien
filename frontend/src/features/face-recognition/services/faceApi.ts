/**
 * Face Recognition API Service
 * =============================
 * API calls cho nhận diện khuôn mặt
 */

import http from '../../../shared/api/http';
import {
  FACE_CONFIG,
  withRetry,
  validateImageFile,
  FaceErrorCode,
  createFaceError
} from '../lib/utils';

export interface FaceHealthResponse {
  status: string;
  models_loaded: boolean;
  detector: string;
  embedder: string;
}

export interface FaceStatusResponse {
  registered: boolean;
  sinhVienId: string;
  mssv: string;
  hoTen: string;
  faceDataId?: string;
  daXacMinh?: boolean;
  soAnhDangKy?: number;
  ngayDangKy?: string;
  ngayCapNhat?: string;
}

export interface FaceRegisterResponse {
  success: boolean;
  message: string;
  sinhVienId?: string;
  faceDataId?: string;
  isUpdate?: boolean;
}

export interface FaceAttendanceResponse {
  success: boolean;
  message: string;
  attendanceId?: string;
  activityId?: string;
  activityName?: string;
  similarity?: number;
  threshold?: number;
  timestamp?: string;
}

/**
 * Kiểm tra trạng thái Face Recognition Service
 */
export async function checkFaceServiceHealth(): Promise<FaceHealthResponse> {
  try {
    // Use retry for health check since it's idempotent
    const response = await withRetry(
      () => http.get('/face/health'),
      {
        maxAttempts: FACE_CONFIG.api.retryAttempts,
        delayMs: FACE_CONFIG.api.retryDelayMs,
        onRetry: (attempt, error) => {
          console.warn(`[FaceAPI] Health check retry ${attempt}:`, error.message);
        }
      }
    );
    return response.data?.data || response.data;
  } catch (error) {
    console.error('[FaceAPI] Health check failed:', error);
    return {
      status: 'unhealthy',
      models_loaded: false,
      detector: 'unknown',
      embedder: 'unknown'
    };
  }
}

/**
 * Lấy trạng thái đăng ký khuôn mặt của sinh viên hiện tại
 */
export async function getFaceStatus(): Promise<FaceStatusResponse | null> {
  try {
    const response = await withRetry(
      () => http.get('/face/status'),
      {
        maxAttempts: FACE_CONFIG.api.retryAttempts,
        delayMs: FACE_CONFIG.api.retryDelayMs
      }
    );
    return response.data?.data || null;
  } catch (error) {
    console.error('[FaceAPI] Get status failed:', error);
    return null;
  }
}

/**
 * Đăng ký khuôn mặt
 * @param imageFile - File ảnh hoặc Blob
 * @param updateIfExists - Cho phép cập nhật nếu đã đăng ký
 */
export async function registerFace(
  imageFile: File | Blob,
  updateIfExists: boolean = false
): Promise<FaceRegisterResponse> {
  try {
    // Validate image before upload
    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      const errorMsg = validation.error?.message || 'File ảnh không hợp lệ';
      return {
        success: false,
        message: errorMsg
      };
    }

    const formData = new FormData();
    formData.append('file', imageFile, 'face.jpg');
    formData.append('updateIfExists', String(updateIfExists));

    // Don't retry registration - it's not idempotent
    // Note: Don't set Content-Type manually when using FormData
    // Browser will automatically set it with the correct boundary
    const response = await http.post('/face/register', formData, {
      timeout: FACE_CONFIG.api.timeoutMs
    });

    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('[FaceAPI] Register failed:', error);
    console.error('[FaceAPI] Response data:', error.response?.data);
    console.error('[FaceAPI] Response status:', error.response?.status);
    return {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail || error.message || 'Đăng ký khuôn mặt thất bại'
    };
  }
}

/**
 * Điểm danh bằng khuôn mặt
 * @param activityId - ID hoạt động
 * @param imageFile - File ảnh hoặc Blob
 * @param threshold - Ngưỡng similarity (mặc định 0.68)
 */
export async function faceAttendance(
  activityId: string,
  imageFile: File | Blob,
  threshold?: number
): Promise<FaceAttendanceResponse> {
  try {
    // Validate image before upload
    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      const errorMsg = validation.error?.message || 'File ảnh không hợp lệ';
      return {
        success: false,
        message: errorMsg
      };
    }

    const formData = new FormData();
    formData.append('file', imageFile, 'face.jpg');
    if (threshold !== undefined) {
      formData.append('threshold', String(threshold));
    }

    // Don't retry attendance - it's not idempotent
    // Note: Don't set Content-Type manually when using FormData
    const response = await http.post(`/face/attendance/${activityId}`, formData, {
      timeout: FACE_CONFIG.api.timeoutMs
    });

    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('[FaceAPI] Attendance failed:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Điểm danh thất bại'
    };
  }
}

/**
 * Xóa dữ liệu khuôn mặt đã đăng ký
 */
export async function deleteFaceData(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await http.delete('/face/register');
    return {
      success: true,
      message: response.data?.message || 'Đã xóa dữ liệu khuôn mặt'
    };
  } catch (error: any) {
    console.error('[FaceAPI] Delete failed:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Xóa dữ liệu thất bại'
    };
  }
}

/**
 * Chuyển canvas thành Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement, quality: number = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Không thể tạo blob từ canvas'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Chuyển video frame thành Blob
 */
export function captureVideoFrame(video: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Không thể tạo canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Không thể capture frame'));
          }
        },
        'image/jpeg',
        0.9
      );
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  checkFaceServiceHealth,
  getFaceStatus,
  registerFace,
  faceAttendance,
  deleteFaceData,
  canvasToBlob,
  captureVideoFrame
};
