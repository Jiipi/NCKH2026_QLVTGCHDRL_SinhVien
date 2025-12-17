/**
 * Admin Reports Module - TypeScript Index
 */

export type {
  ActivityStatusGroup,
  TopActivity,
  RegistrationDateGroup,
  ActivityExportData,
  RegistrationExportData,
  ActivityReportFilter,
  UserWithStudent,
  ActivitySummaryStats,
  RegistrationSummaryStats,
  AdminReportResponse,
  IAdminReportsRepository,
  IGetAdminReportUseCase,
  IExportActivitiesUseCase,
  IExportRegistrationsUseCase,
  IAdminReportsController
} from './admin-reports.types';

const routes = require('./presentation/routes/admin-reports.routes');
export { routes };
module.exports = { routes };
