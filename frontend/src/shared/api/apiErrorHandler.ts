/**
 * Shared API Error Handler
 * ========================
 * Single source of truth for API error handling across all features.
 */

/**
 * Standardized error response from API error
 */
export function handleApiError(error: any, context = 'API') {
  const message = error.response?.data?.message
    || error.message
    || 'Đã có lỗi xảy ra.';

  const code = error.response?.status || null;

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context} Error]`, { message, code, error });
  }

  return {
    success: false as const,
    error: message,
    code,
    data: null
  };
}

/**
 * Standardized success response
 */
export function createSuccessResponse<T = any>(data: T = null as any) {
  return {
    success: true as const,
    data
  };
}

/**
 * Validation error response
 */
export function createValidationError(message: string) {
  return {
    success: false as const,
    error: message,
    code: null
  };
}

/**
 * Extract data from API response with fallbacks
 */
export function extractApiData<T = unknown>(response: any, defaultValue: T = {} as T): T {
  return response?.data?.data ?? response?.data ?? defaultValue;
}

/**
 * Extract array from API response
 */
export function extractArrayData(response: any): any[] {
  const data = response?.data?.data || response?.data || [];
  return Array.isArray(data) ? data : [];
}

/**
 * Extract array items from payload (handles items/data/array formats)
 */
export function extractArrayItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
