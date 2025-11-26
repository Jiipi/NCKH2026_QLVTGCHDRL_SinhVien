/**
 * Centralized API Error Handler for QR Attendance Feature
 */

export const handleApiError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'Điểm danh thất bại. Vui lòng thử lại.';
  const code = error?.response?.status || null;
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[QR Attendance API Error]', { message, code, error });
  }
  
  return { 
    success: false, 
    error: message, 
    code,
    data: null
  };
};

export const createSuccessResponse = (data = null, message = null) => {
  const response = { success: true, data };
  if (message) response.message = message;
  return response;
};

export const extractApiData = (response) => {
  return response?.data?.data || response?.data || {};
};
