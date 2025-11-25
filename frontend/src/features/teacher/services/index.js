/**
 * Teacher Services Index
 * ======================
 * Central export for all teacher-related API services
 * 
 * @module features/teacher/services
 */

export { 
  teacherStudentsApi, 
  teacherClassesApi,
  default as studentsApi 
} from './teacherStudentsApi';

export { default as teacherActivitiesApi } from './teacherActivitiesApi';
export { default as teacherApprovalApi } from './teacherApprovalApi';
export { default as teacherAttendanceApi } from './teacherAttendanceApi';
export { default as teacherDashboardApi } from './teacherDashboardApi';
export { default as teacherRegistrationsApi } from './teacherRegistrationsApi';
export { default as teacherStudentScoresApi } from './teacherStudentScoresApi';
