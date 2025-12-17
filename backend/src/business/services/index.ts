/**
 * Business Services Index
 * Export all business layer services
 */

export { ActivityService, activityService } from './activity.service';
export { RegistrationService, registrationService } from './registration.service';
export { default as AuthService } from './auth.service';
export { default as SessionTrackingService } from './session-tracking.service';
export { default as BroadcastService } from './broadcast.service';
export { default as SemesterClosureService, SemesterInfo, SemesterState, StatusResult } from './semesterClosure.service';
export { default as QrAttendanceService } from './qr-attendance.service';
export { default as ReferenceDataService, ClassInfo, UserInfo, RoleInfo, DemoUserInfo } from './reference-data.service';

// Re-export types for convenience
export type {
    IActivityService,
    IRegistrationService,
    IUserService
} from '../../core/types';
