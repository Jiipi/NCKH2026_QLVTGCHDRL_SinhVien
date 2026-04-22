/**
 * useFaceRecognition Hook
 * ========================
 * Hook quản lý state và logic cho nhận diện khuôn mặt
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  checkFaceServiceHealth,
  getFaceStatus,
  registerFace,
  faceAttendance,
  deleteFaceData,
  captureVideoFrame,
  FaceStatusResponse,
  FaceHealthResponse,
  FaceRegisterResponse,
  FaceAttendanceResponse
} from '../../services/faceApi';

interface UseFaceRecognitionOptions {
  autoCheckStatus?: boolean;
  autoCheckHealth?: boolean;
}

interface UseFaceRecognitionReturn {
  // Service status
  serviceHealth: FaceHealthResponse | null;
  isServiceReady: boolean;

  // Face registration status
  faceStatus: FaceStatusResponse | null;
  isRegistered: boolean;

  // Loading states
  isLoading: boolean;
  isRegistering: boolean;
  isAttending: boolean;
  isDeleting: boolean;

  // Error
  error: string | null;

  // Camera
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  captureFrame: () => Promise<Blob | null>;

  // Actions
  checkHealth: () => Promise<FaceHealthResponse>;
  checkStatus: () => Promise<FaceStatusResponse | null>;
  register: (imageBlobs: Blob | Blob[], update?: boolean) => Promise<FaceRegisterResponse>;
  registerFromCamera: (update?: boolean) => Promise<FaceRegisterResponse>;
  attend: (activityId: string, imageBlob: Blob) => Promise<FaceAttendanceResponse>;
  attendFromCamera: (activityId: string) => Promise<FaceAttendanceResponse>;
  deleteRegistration: () => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export function useFaceRecognition(
  options: UseFaceRecognitionOptions = {}
): UseFaceRecognitionReturn {
  const { autoCheckStatus = true, autoCheckHealth = true } = options;

  // State
  const [serviceHealth, setServiceHealth] = useState<FaceHealthResponse | null>(null);
  const [faceStatus, setFaceStatus] = useState<FaceStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Derived state
  const isServiceReady = serviceHealth?.status === 'healthy' && serviceHealth?.models_loaded === true;
  const isRegistered = faceStatus?.registered === true;

  // Check service health
  const checkHealth = useCallback(async (): Promise<FaceHealthResponse> => {
    const health = await checkFaceServiceHealth();
    setServiceHealth(health);
    return health;
  }, []);

  // Check face registration status
  const checkStatus = useCallback(async (): Promise<FaceStatusResponse | null> => {
    setIsLoading(true);
    try {
      const status = await getFaceStatus();
      setFaceStatus(status);
      return status;
    } catch (err: any) {
      setError(err.message || 'Lỗi kiểm tra trạng thái');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async (): Promise<boolean> => {
    try {
      if (streamRef.current) {
        return true; // Already streaming
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);
      return true;
    } catch (err: any) {
      console.error('[useFaceRecognition] Camera error:', err);
      setError('Không thể truy cập camera. Vui lòng cấp quyền.');
      return false;
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Capture frame from camera
  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !isStreaming) {
      setError('Camera chưa được bật');
      return null;
    }

    try {
      const blob = await captureVideoFrame(videoRef.current);
      return blob;
    } catch (err: any) {
      setError(err.message || 'Không thể chụp ảnh');
      return null;
    }
  }, [isStreaming]);

  // Register face
  const register = useCallback(async (
    imageBlobs: Blob | Blob[],
    update: boolean = false
  ): Promise<FaceRegisterResponse> => {
    setIsRegistering(true);
    setError(null);

    try {
      // registerFace now accepts both single and array
      const result = await registerFace(imageBlobs, update);

      if (result.success) {
        // Refresh status after successful registration
        await checkStatus();
      } else {
        setError(result.message);
      }

      return result;
    } catch (err: any) {
      const message = err.message || 'Đăng ký khuôn mặt thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setIsRegistering(false);
    }
  }, [checkStatus]);

  // Register from camera (capture + register)
  const registerFromCamera = useCallback(async (
    update: boolean = false
  ): Promise<FaceRegisterResponse> => {
    const blob = await captureFrame();
    if (!blob) {
      return { success: false, message: 'Không thể chụp ảnh từ camera' };
    }
    return register(blob, update);
  }, [captureFrame, register]);

  // Face attendance
  const attend = useCallback(async (
    activityId: string,
    imageBlob: Blob
  ): Promise<FaceAttendanceResponse> => {
    setIsAttending(true);
    setError(null);

    try {
      const result = await faceAttendance(activityId, imageBlob);

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err: any) {
      const message = err.message || 'Điểm danh thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setIsAttending(false);
    }
  }, []);

  // Attend from camera (capture + attend)
  const attendFromCamera = useCallback(async (
    activityId: string
  ): Promise<FaceAttendanceResponse> => {
    const blob = await captureFrame();
    if (!blob) {
      return { success: false, message: 'Không thể chụp ảnh từ camera' };
    }
    return attend(activityId, blob);
  }, [captureFrame, attend]);

  // Delete registration
  const deleteRegistration = useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteFaceData();

      if (result.success) {
        setFaceStatus(prev => prev ? { ...prev, registered: false } : null);
      } else {
        setError(result.message);
      }

      return result;
    } catch (err: any) {
      const message = err.message || 'Xóa dữ liệu thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto check on mount
  useEffect(() => {
    if (autoCheckHealth) {
      checkHealth();
    }
    if (autoCheckStatus) {
      checkStatus();
    }
  }, [autoCheckHealth, autoCheckStatus, checkHealth, checkStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    // Service status
    serviceHealth,
    isServiceReady,

    // Face registration status
    faceStatus,
    isRegistered,

    // Loading states
    isLoading,
    isRegistering,
    isAttending,
    isDeleting,

    // Error
    error,

    // Camera
    videoRef,
    isStreaming,
    startCamera,
    stopCamera,
    captureFrame,

    // Actions
    checkHealth,
    checkStatus,
    register,
    registerFromCamera,
    attend,
    attendFromCamera,
    deleteRegistration,
    clearError
  };
}

export default useFaceRecognition;
