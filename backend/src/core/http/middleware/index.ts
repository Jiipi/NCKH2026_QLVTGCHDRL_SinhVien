/**
 * Core HTTP Middleware Exports
 * Central export point for all middleware functions
 * @module core/http/middleware
 */

// Authentication & Authorization
export * from './asyncHandler';
export * from './authJwt';
export * from './errorHandler';
export * from './requestContext';
export * from './rateLimiters';

// Validation & Sanitization
export * from './validate';
export * from './sanitize';
// Backward compatibility alias
export { sanitizeMiddleware as sanitize } from './sanitize';

// CORS
export * from './cors';
// Backward compatibility alias
export { corsMiddleware as cors } from './cors';

// Session Tracking
export * from './sessionTracking';

// Dynamic Permissions
export * from './dynamicPermission';

// Class-based Access Control
export * from './classMonitor';
export * from './classScope';

// Semester Lock
export * from './semesterLock.middleware';

// Error Handlers
export { default as errorMiddleware } from './error';
export { default as notFoundMiddleware } from './notFound';

// File Uploads
export * from './upload';
export { default as uploadAvatar } from './uploadAvatar';
export { uploadExcel, handleUploadError as handleExcelUploadError } from './uploadExcel';

// Re-export types
export type { AuthenticatedRequest, JwtPayload } from './authJwt';
export type { RequestContext, ContextualRequest } from './requestContext';
export type { PermissionRequest } from './dynamicPermission';
