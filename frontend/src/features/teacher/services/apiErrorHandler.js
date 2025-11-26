/**
 * Teacher API Error Handler (DRY Principle)
 * ==========================================
 * Centralized error handling for all teacher API services
 * 
 * @module features/teacher/services/apiErrorHandler
 */

/**
 * Create a standardized error response from API error
 * @param {Error} error - The error object from API call
 * @param {string} [context] - Optional context for logging (e.g., 'Dashboard', 'Activities')
 * @returns {{ success: false, error: string, code: number|null }}
 */
export function handleApiError(error, context = 'API') {
  const message = error.response?.data?.message 
    || error.message 
    || 'Đã có lỗi xảy ra.';
  
  const code = error.response?.status || null;
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Teacher ${context} Error]`, { message, code, error });
  }
  
  return { 
    success: false, 
    error: message, 
    code 
  };
}

/**
 * Create a standardized success response
 * @param {any} data - The data to return
 * @returns {{ success: true, data: any }}
 */
export function createSuccessResponse(data) {
  return {
    success: true,
    data
  };
}

/**
 * Create a validation error response
 * @param {string} message - The validation error message
 * @returns {{ success: false, error: string, code: null }}
 */
export function createValidationError(message) {
  return {
    success: false,
    error: message,
    code: null
  };
}

/**
 * Extract data from API response with fallbacks
 * @param {Object} response - Axios response object
 * @param {any} [defaultValue=[]] - Default value if data not found
 * @returns {any} Extracted data
 */
export function extractApiData(response, defaultValue = []) {
  return response?.data?.data || response?.data || defaultValue;
}

/**
 * Extract array items from API response
 * @param {any} payload - API payload
 * @returns {Array} Array of items
 */
export function extractArrayItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
