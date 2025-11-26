/**
 * Centralized API Error Handler for Users Feature
 */

export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  const code = error.response?.status || null;
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Users API Error]', { message, code, error });
  }
  
  return { 
    success: false, 
    error: message, 
    code,
    data: null
  };
};

export const createSuccessResponse = (data = null, extra = {}) => ({
  success: true,
  data,
  ...extra
});

export const extractApiData = (response) => {
  return response.data?.data || response.data || {};
};

export const extractArrayData = (response) => {
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};
