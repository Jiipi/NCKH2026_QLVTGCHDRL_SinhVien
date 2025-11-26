/**
 * Centralized API Error Handler for Approvals Feature
 * DRY: Single source of truth for error handling patterns
 */

/**
 * Handles API errors consistently
 * @param {Error} error - The error object from axios
 * @returns {object} Standardized error response
 */
export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  const code = error.response?.status || null;
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Approvals API Error]', { message, code, error });
  }
  
  return { 
    success: false, 
    error: message, 
    code,
    data: null
  };
};

/**
 * Creates a standardized success response
 * @param {any} data - The response data
 * @returns {object} Standardized success response
 */
export const createSuccessResponse = (data = null) => ({
  success: true,
  data
});

/**
 * Extracts array data from API response
 * @param {object} response - Axios response object
 * @returns {Array} Extracted array
 */
export const extractArrayData = (response) => {
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
};
