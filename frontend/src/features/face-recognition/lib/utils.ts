/**
 * Face Recognition Utilities
 * ==========================
 * Helper functions, validation, và error handling
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const FACE_CONFIG = {
  // Camera settings
  camera: {
    width: 640,
    height: 480,
    facingMode: 'user' as const,
    frameRate: 30
  },

  // Image validation
  image: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    minWidth: 200,
    minHeight: 200,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as readonly string[],
    quality: 0.9
  },

  // Registration
  registration: {
    minImages: 3,
    maxImages: 5,
    recommendedImages: 3
  },

  // Attendance
  attendance: {
    defaultThreshold: 0.68,
    minThreshold: 0.5,
    maxThreshold: 0.9
  },

  // API
  api: {
    retryAttempts: 3,
    retryDelayMs: 1000,
    timeoutMs: 200000, // 200s - đồng bộ với backend timeout (180s) + buffer 20s
    // Aliases for convenience
    get maxRetries() { return this.retryAttempts; },
    get retryDelay() { return this.retryDelayMs; },
    get timeout() { return this.timeoutMs; }
  }
};

// =============================================================================
// ERROR TYPES
// =============================================================================

export enum FaceErrorCode {
  // Camera errors
  CAMERA_NOT_FOUND = 'CAMERA_NOT_FOUND',
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  CAMERA_IN_USE = 'CAMERA_IN_USE',
  CAMERA_GENERAL_ERROR = 'CAMERA_GENERAL_ERROR',

  // Image errors
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  IMAGE_TOO_SMALL = 'IMAGE_TOO_SMALL',
  IMAGE_INVALID_TYPE = 'IMAGE_INVALID_TYPE',
  IMAGE_CAPTURE_FAILED = 'IMAGE_CAPTURE_FAILED',

  // Face detection errors
  NO_FACE_DETECTED = 'NO_FACE_DETECTED',
  MULTIPLE_FACES = 'MULTIPLE_FACES',
  FACE_TOO_SMALL = 'FACE_TOO_SMALL',
  FACE_NOT_CENTERED = 'FACE_NOT_CENTERED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Auth errors
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',

  // Business errors
  ALREADY_REGISTERED = 'ALREADY_REGISTERED',
  NOT_REGISTERED = 'NOT_REGISTERED',
  FACE_MISMATCH = 'FACE_MISMATCH',
  ALREADY_ATTENDED = 'ALREADY_ATTENDED',
  ACTIVITY_NOT_ACTIVE = 'ACTIVITY_NOT_ACTIVE',

  // Unknown
  UNKNOWN = 'UNKNOWN'
}

export interface FaceError {
  code: FaceErrorCode;
  message: string;
  details?: string;
  retryable: boolean;
}

const ERROR_MESSAGES: Record<FaceErrorCode, string> = {
  [FaceErrorCode.CAMERA_NOT_FOUND]: 'Không tìm thấy camera. Vui lòng kết nối camera và thử lại.',
  [FaceErrorCode.CAMERA_PERMISSION_DENIED]: 'Vui lòng cấp quyền truy cập camera để sử dụng tính năng này.',
  [FaceErrorCode.CAMERA_IN_USE]: 'Camera đang được sử dụng bởi ứng dụng khác.',
  [FaceErrorCode.CAMERA_GENERAL_ERROR]: 'Không thể truy cập camera. Vui lòng thử lại.',

  [FaceErrorCode.IMAGE_TOO_LARGE]: 'Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.',
  [FaceErrorCode.IMAGE_TOO_SMALL]: 'Ảnh quá nhỏ. Vui lòng chọn ảnh có độ phân giải cao hơn.',
  [FaceErrorCode.IMAGE_INVALID_TYPE]: 'Định dạng ảnh không hỗ trợ. Vui lòng sử dụng JPG, PNG hoặc WebP.',
  [FaceErrorCode.IMAGE_CAPTURE_FAILED]: 'Không thể chụp ảnh. Vui lòng thử lại.',

  [FaceErrorCode.NO_FACE_DETECTED]: 'Không phát hiện khuôn mặt. Hãy đảm bảo khuôn mặt nằm trong khung hình.',
  [FaceErrorCode.MULTIPLE_FACES]: 'Phát hiện nhiều khuôn mặt. Chỉ được có 1 người trong khung hình.',
  [FaceErrorCode.FACE_TOO_SMALL]: 'Khuôn mặt quá nhỏ. Hãy di chuyển lại gần camera hơn.',
  [FaceErrorCode.FACE_NOT_CENTERED]: 'Khuôn mặt không ở giữa. Hãy điều chỉnh vị trí.',

  [FaceErrorCode.NETWORK_ERROR]: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  [FaceErrorCode.TIMEOUT]: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
  [FaceErrorCode.SERVER_ERROR]: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  [FaceErrorCode.SERVICE_UNAVAILABLE]: 'Dịch vụ nhận dạng khuôn mặt đang bảo trì.',

  [FaceErrorCode.NOT_AUTHENTICATED]: 'Vui lòng đăng nhập để tiếp tục.',
  [FaceErrorCode.NOT_AUTHORIZED]: 'Bạn không có quyền thực hiện thao tác này.',

  [FaceErrorCode.ALREADY_REGISTERED]: 'Bạn đã đăng ký khuôn mặt rồi. Bạn có muốn cập nhật không?',
  [FaceErrorCode.NOT_REGISTERED]: 'Bạn chưa đăng ký khuôn mặt. Vui lòng đăng ký trước.',
  [FaceErrorCode.FACE_MISMATCH]: 'Khuôn mặt không khớp với dữ liệu đã đăng ký.',
  [FaceErrorCode.ALREADY_ATTENDED]: 'Bạn đã điểm danh hoạt động này rồi.',
  [FaceErrorCode.ACTIVITY_NOT_ACTIVE]: 'Hoạt động này không trong thời gian điểm danh.',

  [FaceErrorCode.UNKNOWN]: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
};

const RETRYABLE_ERRORS = new Set([
  FaceErrorCode.NETWORK_ERROR,
  FaceErrorCode.TIMEOUT,
  FaceErrorCode.SERVER_ERROR,
  FaceErrorCode.SERVICE_UNAVAILABLE,
  FaceErrorCode.IMAGE_CAPTURE_FAILED
]);

/**
 * Tạo FaceError từ error code
 */
export function createFaceError(code: FaceErrorCode, details?: string): FaceError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    details,
    retryable: RETRYABLE_ERRORS.has(code)
  };
}

/**
 * Parse error từ API response hoặc exception
 */
export function parseError(error: any): FaceError {
  // Network errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return createFaceError(FaceErrorCode.TIMEOUT);
  }

  if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
    return createFaceError(FaceErrorCode.NETWORK_ERROR);
  }

  // HTTP status codes
  const status = error.response?.status;
  if (status === 401) {
    return createFaceError(FaceErrorCode.NOT_AUTHENTICATED);
  }
  if (status === 403) {
    return createFaceError(FaceErrorCode.NOT_AUTHORIZED);
  }
  if (status === 503) {
    return createFaceError(FaceErrorCode.SERVICE_UNAVAILABLE);
  }
  if (status >= 500) {
    return createFaceError(FaceErrorCode.SERVER_ERROR, error.response?.data?.error);
  }

  // API error messages
  const apiMessage = error.response?.data?.error?.toLowerCase() || '';

  if (apiMessage.includes('no face') || apiMessage.includes('không tìm thấy khuôn mặt')) {
    return createFaceError(FaceErrorCode.NO_FACE_DETECTED);
  }
  if (apiMessage.includes('multiple face') || apiMessage.includes('nhiều khuôn mặt')) {
    return createFaceError(FaceErrorCode.MULTIPLE_FACES);
  }
  if (apiMessage.includes('already registered') || apiMessage.includes('đã đăng ký')) {
    return createFaceError(FaceErrorCode.ALREADY_REGISTERED);
  }
  if (apiMessage.includes('not registered') || apiMessage.includes('chưa đăng ký')) {
    return createFaceError(FaceErrorCode.NOT_REGISTERED);
  }
  if (apiMessage.includes('mismatch') || apiMessage.includes('không khớp')) {
    return createFaceError(FaceErrorCode.FACE_MISMATCH);
  }
  if (apiMessage.includes('already attended') || apiMessage.includes('đã điểm danh')) {
    return createFaceError(FaceErrorCode.ALREADY_ATTENDED);
  }

  // Camera errors (from getUserMedia)
  if (error.name === 'NotFoundError') {
    return createFaceError(FaceErrorCode.CAMERA_NOT_FOUND);
  }
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return createFaceError(FaceErrorCode.CAMERA_PERMISSION_DENIED);
  }
  if (error.name === 'NotReadableError') {
    return createFaceError(FaceErrorCode.CAMERA_IN_USE);
  }

  // Default
  return createFaceError(FaceErrorCode.UNKNOWN, error.message);
}

// =============================================================================
// VALIDATION
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: FaceError;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File | Blob): ValidationResult {
  // Check size
  if (file.size > FACE_CONFIG.image.maxSizeBytes) {
    return { valid: false, error: createFaceError(FaceErrorCode.IMAGE_TOO_LARGE) };
  }

  // Check type
  if (file instanceof File) {
    if (!FACE_CONFIG.image.allowedTypes.includes(file.type)) {
      return { valid: false, error: createFaceError(FaceErrorCode.IMAGE_INVALID_TYPE) };
    }
  }

  return { valid: true };
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(file: File | Blob): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width < FACE_CONFIG.image.minWidth || img.height < FACE_CONFIG.image.minHeight) {
        resolve({ valid: false, error: createFaceError(FaceErrorCode.IMAGE_TOO_SMALL) });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: createFaceError(FaceErrorCode.IMAGE_INVALID_TYPE) });
    };

    img.src = url;
  });
}

// =============================================================================
// RETRY LOGIC
// =============================================================================

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: FaceError) => void;
}

/**
 * Retry một async function với exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = FACE_CONFIG.api.retryAttempts,
    delayMs = FACE_CONFIG.api.retryDelayMs,
    backoffMultiplier = 2,
    onRetry
  } = options;

  let lastError: FaceError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = parseError(error);

      // Không retry nếu lỗi không retryable
      if (!lastError.retryable || attempt === maxAttempts) {
        throw lastError;
      }

      // Callback before retry
      onRetry?.(attempt, lastError);

      // Wait với exponential backoff
      const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      await sleep(waitTime);
    }
  }

  throw lastError || createFaceError(FaceErrorCode.UNKNOWN);
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check camera permission status
 */
export async function checkCameraPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state;
  } catch {
    // Fallback: try to access camera
    return 'prompt';
  }
}

/**
 * Check if device has camera
 */
export async function hasCamera(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

/**
 * Get available cameras
 */
export async function getCameras(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch {
    return [];
  }
}

/**
 * Format confidence/similarity score
 */
export function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Check if browser supports required APIs
 */
export function checkBrowserSupport(): { supported: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!navigator.mediaDevices?.getUserMedia) {
    missing.push('Camera API (getUserMedia)');
  }

  if (!window.Blob) {
    missing.push('Blob API');
  }

  if (!window.FormData) {
    missing.push('FormData API');
  }

  if (!HTMLCanvasElement.prototype.toBlob) {
    missing.push('Canvas toBlob');
  }

  return {
    supported: missing.length === 0,
    missing
  };
}

export default {
  FACE_CONFIG,
  FaceErrorCode,
  createFaceError,
  parseError,
  validateImageFile,
  validateImageDimensions,
  withRetry,
  sleep,
  checkCameraPermission,
  hasCamera,
  getCameras,
  formatConfidence,
  checkBrowserSupport
};
