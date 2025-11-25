/**
 * Services Index
 * Centralized export for all services
 */

const AuthService = require('./auth.service');
const ReferenceDataService = require('./reference-data.service');
// AdminReportsService moved to modules/admin-reports
// AdminUsersService moved to modules/admin-users
const BroadcastService = require('./broadcast.service');
const QRAttendanceService = require('./qr-attendance.service');
const SemesterClosureService = require('./semesterClosure.service');
const AutoPointCalculationService = require('./auto-point-calculation.service');
const SessionTrackingService = require('./session-tracking.service');

module.exports = {
  AuthService,
  ReferenceDataService,
  // AdminReportsService - use modules/admin-reports instead
  // AdminUsersService - use modules/admin-users instead
  BroadcastService,
  QRAttendanceService,
  SemesterClosureService,
  AutoPointCalculationService,
  SessionTrackingService
};






