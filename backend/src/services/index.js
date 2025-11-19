/**
 * Services Index
 * Centralized export for all services
 */

const AuthService = require('./auth.service');
const ReferenceDataService = require('./reference-data.service');
const StudentPointsService = require('./student-points.service');
const AdminReportsService = require('./admin-reports.service');
const AdminUsersService = require('./admin-users.service');
const BroadcastService = require('./broadcast.service');
const QRAttendanceService = require('./qr-attendance.service');
const SemesterClosureService = require('./semesterClosure.service');
const AutoPointCalculationService = require('./auto-point-calculation.service');
const SessionTrackingService = require('./session-tracking.service');

module.exports = {
  AuthService,
  ReferenceDataService,
  StudentPointsService,
  AdminReportsService,
  AdminUsersService,
  BroadcastService,
  QRAttendanceService,
  SemesterClosureService,
  AutoPointCalculationService,
  SessionTrackingService
};






