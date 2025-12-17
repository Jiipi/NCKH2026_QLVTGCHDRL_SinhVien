/**
 * Centralized API Error Handler for Dashboard Feature
 */

export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  const code = error.response?.status || null;
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Dashboard API Error]', { message, code, error });
  }
  
  return { 
    success: false, 
    error: message, 
    code,
    data: null
  };
};

export const createSuccessResponse = (data = null) => ({
  success: true,
  data
});

export const extractApiData = (response) => {
  return response.data?.data || response.data || {};
};
