/**
 * Teacher Services Index (Tier 3: Data/API Layer)
 * ================================================
 * Barrel exports for all teacher API services
 * 
 * SOLID: Single point of entry for all teacher services
 * 
 * @module features/teacher/services
 */

// Error handling utilities (DRY)
export { 
  handleApiError, 
  createSuccessResponse, 
  createValidationError,
  extractApiData,
  extractArrayItems
} from './apiErrorHandler';

// API Services
export { 
  teacherStudentsApi, 
  teacherClassesApi,
  default as studentsApi 
} from './teacherStudentsApi';

export { teacherActivitiesApi, default as activitiesApi } from './teacherActivitiesApi';
export { teacherApprovalApi, default as approvalApi } from './teacherApprovalApi';
export { teacherAttendanceApi, default as attendanceApi } from './teacherAttendanceApi';
export { teacherDashboardApi, default as dashboardApi } from './teacherDashboardApi';
export { teacherRegistrationsApi, default as registrationsApi } from './teacherRegistrationsApi';
export { teacherStudentScoresApi, default as studentScoresApi } from './teacherStudentScoresApi';
