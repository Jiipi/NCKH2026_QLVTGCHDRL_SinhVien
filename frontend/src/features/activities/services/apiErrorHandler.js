/**
 * Centralized API Error Handler for Activities Feature
 * DRY: Single source of truth for error handling patterns
 */

/**
 * Handles API errors consistently across all activity services
 * @param {Error} error - The error object from axios
 * @returns {object} Standardized error response
 */
export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  const code = error.response?.status || null;
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Activities API Error]', { message, code, error });
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
 * @param {number} total - Optional total count for paginated responses
 * @returns {object} Standardized success response
 */
export const createSuccessResponse = (data, total = null) => {
  const response = { success: true, data };
  if (total !== null) {
    response.total = total;
  }
  return response;
};

/**
 * Creates a validation error response
 * @param {string} message - Error message
 * @param {object} fieldErrors - Optional field-level errors
 * @returns {object} Validation error response
 */
export const createValidationError = (message, fieldErrors = {}) => ({
  success: false,
  error: message,
  code: 400,
  fieldErrors,
  data: null
});

/**
 * Extracts data from API response with fallback
 * @param {object} response - Axios response object
 * @returns {any} Extracted data
 */
export const extractApiData = (response) => {
  return response.data?.data || response.data || {};
};

/**
 * Extracts array items from paginated API response
 * @param {object} response - Axios response object
 * @returns {object} Object with items array and total count
 */
export const extractPaginatedData = (response) => {
  const data = response.data?.data || response.data || {};
  return {
    items: data.items || [],
    total: data.total || 0
  };
};

/**
 * Extracts array from API response (handles various response formats)
 * @param {object} response - Axios response object
 * @returns {Array} Extracted array
 */
export const extractArrayData = (response) => {
  const raw = response.data?.data || response.data || [];
  return Array.isArray(raw) ? raw : (raw.items || []);
};
