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
  model_name?: string;
  model_version?: string;
  embedding_dim?: number;
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
  anhKhuonMat?: string | null;
  anhKhuonMatDs?: string[] | null;
  hasFaceImage?: boolean;
}

export interface FaceRegisterResponse {
  success: boolean;
  message: string;
  sinhVienId?: string;
  faceDataId?: string;
  isUpdate?: boolean;
  errorCode?: string;
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
  errorCode?: string;
}

export interface ConsentStatusResponse {
  hasConsent: boolean;
  currentVersion: string;
  acceptedVersion?: string;
  acceptedAt?: string;
  needsConsent: boolean;
  policy: {
    title: string;
    version: string;
    sections: Array<{ title: string; content: string }>;
  };
}

export interface FallbackRequestResponse {
  success: boolean;
  message: string;
  requestId?: string;
  status?: string;
}

/**
 * Kiểm tra trạng thái Face Recognition Service
 */
export async function checkFaceServiceHealth(): Promise<FaceHealthResponse> {
  try {
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

// ========================
// CONSENT API
// ========================

/**
 * Kiểm tra trạng thái consent sinh trắc học
 */
export async function checkConsent(): Promise<ConsentStatusResponse | null> {
  try {
    const response = await http.get('/face/consent');
    return response.data?.data || null;
  } catch (error) {
    console.error('[FaceAPI] Check consent failed:', error);
    return null;
  }
}

/**
 * Ghi nhận đồng ý chính sách sinh trắc học
 */
export async function acceptConsent(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await http.post('/face/consent');
    return response.data?.data || { success: true, message: 'Đã đồng ý' };
  } catch (error: any) {
    console.error('[FaceAPI] Accept consent failed:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Lỗi ghi nhận đồng ý'
    };
  }
}

// ========================
// REGISTRATION API
// ========================

/**
 * Đăng ký khuôn mặt
 * @param imageFiles - File ảnh hoặc Blob (1 hoặc nhiều ảnh)
 * @param updateIfExists - Cho phép cập nhật nếu đã đăng ký
 */
export async function registerFace(
  imageFiles: (File | Blob)[] | File | Blob,
  updateIfExists: boolean = false
): Promise<FaceRegisterResponse> {
  try {
    // Normalize to array
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

    if (files.length === 0) {
      return { success: false, message: 'Cần ít nhất 1 ảnh để đăng ký' };
    }

    // Validate all images before upload
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        const errorMsg = validation.error?.message || 'File ảnh không hợp lệ';
        return { success: false, message: errorMsg };
      }
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file, `face_${index + 1}.jpg`);
    });
    formData.append('updateIfExists', String(updateIfExists));

    const response = await http.post('/face/register', formData, {
      timeout: FACE_CONFIG.api.timeoutMs
    });

    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('[FaceAPI] Register failed:', error);
    const errorCode = error.response?.data?.data?.errorCode || error.response?.data?.errorCode;
    return {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail || error.message || 'Đăng ký khuôn mặt thất bại',
      errorCode
    };
  }
}

// ========================
// ATTENDANCE API
// ========================

/**
 * Điểm danh bằng khuôn mặt
 * @param activityId - ID hoạt động
 * @param imageFile - File ảnh hoặc Blob
 * @param threshold - Ngưỡng similarity (mặc định 0.68)
 * @param location - Vị trí GPS khi điểm danh
 */
export async function faceAttendance(
  activityId: string,
  imageFile: File | Blob,
  threshold?: number,
  location?: { latitude: number; longitude: number; accuracy?: number } | null
): Promise<FaceAttendanceResponse> {
  try {
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

    // Gửi kèm vị trí GPS nếu có
    if (location) {
      formData.append('latitude', String(location.latitude));
      formData.append('longitude', String(location.longitude));
      if (location.accuracy !== undefined) {
        formData.append('accuracy', String(location.accuracy));
      }
    }

    const response = await http.post(`/face/attendance/${activityId}`, formData, {
      timeout: FACE_CONFIG.api.timeoutMs
    });

    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('[FaceAPI] Attendance failed:', error);
    console.error('[FaceAPI] Attendance response:', error.response?.data);
    const respData = error.response?.data;
    const errorCode = respData?.data?.errorCode || respData?.errorCode || respData?.error?.code || 'UNKNOWN';
    return {
      success: false,
      message: respData?.data?.message || respData?.message || respData?.error?.message || respData?.error || error.message || 'Điểm danh thất bại',
      errorCode
    };
  }
}

// ========================
// FALLBACK API
// ========================

/**
 * Tạo yêu cầu điểm danh thủ công khi face fail
 */
export async function createFaceFallback(
  activityId: string,
  reason: string,
  errorCode?: string,
  similarity?: number,
  location?: { latitude: number; longitude: number; accuracy?: number } | null
): Promise<FallbackRequestResponse> {
  try {
    const body: any = { reason, errorCode, similarity };
    if (location) {
      body.latitude = location.latitude;
      body.longitude = location.longitude;
      body.accuracy = location.accuracy;
    }

    const response = await http.post(`/face/fallback/${activityId}`, body);
    const data = response.data?.data || response.data;
    return {
      success: true,
      message: data?.message || 'Đã gửi yêu cầu xác minh',
      requestId: data?.requestId,
      status: data?.status
    };
  } catch (error: any) {
    console.error('[FaceAPI] Fallback failed:', error);
    return {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể gửi yêu cầu'
    };
  }
}

// ========================
// ADMIN API
// ========================

/**
 * Lấy danh sách face registrations (Admin/GV)
 */
export async function getAdminFaceRegistrations(
  params: { status?: string; classId?: string; page?: number; limit?: number } = {}
) {
  try {
    const response = await http.get('/face/admin/registrations', { params });
    return response.data?.data || null;
  } catch (error: any) {
    console.error('[FaceAPI] Admin list failed:', error);
    return null;
  }
}

/**
 * Xác minh face data (Admin/GV)
 */
export async function verifyFaceData(faceDataId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await http.patch(`/face/admin/registrations/${faceDataId}/verify`);
    return response.data?.data || { success: true, message: 'Đã xác minh' };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Lỗi xác minh'
    };
  }
}

/**
 * Từ chối face data (Admin/GV)
 */
export async function rejectFaceData(faceDataId: string, reason?: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await http.patch(`/face/admin/registrations/${faceDataId}/reject`, { reason });
    return response.data?.data || { success: true, message: 'Đã từ chối' };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || error.message || 'Lỗi từ chối'
    };
  }
}

// ========================
// DELETE
// ========================

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

// ========================
// UTILITIES
// ========================

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
  checkConsent,
  acceptConsent,
  registerFace,
  faceAttendance,
  createFaceFallback,
  getAdminFaceRegistrations,
  verifyFaceData,
  rejectFaceData,
  deleteFaceData,
  canvasToBlob,
  captureVideoFrame
};
