/**
 * Re-export from shared API error handler
 * All features now use the same centralized handler
 */
export { handleApiError, createSuccessResponse, createValidationError, extractApiData, extractArrayData, extractArrayItems } from '../../../shared/api/apiErrorHandler';
