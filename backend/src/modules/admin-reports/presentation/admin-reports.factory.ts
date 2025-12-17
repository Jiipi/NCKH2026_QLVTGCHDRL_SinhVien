/**
 * Admin Reports Factory
 * Creates instances of admin reports controller with dependencies
 */
import adminReportsRepository from '../data/repositories/admin-reports.repository';
import GetUserPointsReportUseCase from '../business/services/GetUserPointsReportUseCase';
import GetAttendanceReportUseCase from '../business/services/GetAttendanceReportUseCase';
import GetClassesListUseCase from '../business/services/GetClassesListUseCase';
import GetOverviewUseCase from '../business/services/GetOverviewUseCase';
import ExportActivitiesUseCase from '../business/services/ExportActivitiesUseCase';
import ExportRegistrationsUseCase from '../business/services/ExportRegistrationsUseCase';
import AdminReportsController from './controllers/AdminReportsController';

function createAdminReportsController(): AdminReportsController {
  // Data layer
  const repo = adminReportsRepository;

  // Business layer (Use Cases)
  const useCases = {
    getUserPointsReport: new GetUserPointsReportUseCase(repo),
    getAttendanceReport: new GetAttendanceReportUseCase(repo),
    getClassesList: new GetClassesListUseCase(repo),
    getOverview: new GetOverviewUseCase(repo),
    exportActivities: new ExportActivitiesUseCase(repo),
    exportRegistrations: new ExportRegistrationsUseCase(repo),
  };

  // Presentation layer
  const controller = new AdminReportsController(useCases);

  return controller;
}

export { createAdminReportsController };
module.exports = { createAdminReportsController };
