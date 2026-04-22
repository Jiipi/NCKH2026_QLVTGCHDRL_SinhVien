/**
 * Re-export from shared API error handler
 * All features now use the same centralized handler
 */
export { handleApiError, createSuccessResponse, createValidationError, extractApiData, extractArrayData } from '../../../shared/api/apiErrorHandler';
