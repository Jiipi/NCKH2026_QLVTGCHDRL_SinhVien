const adminReportsRepository = require('../data/repositories/admin-reports.repository');
const GetUserPointsReportUseCase = require('../business/services/GetUserPointsReportUseCase');
const GetAttendanceReportUseCase = require('../business/services/GetAttendanceReportUseCase');
const GetClassesListUseCase = require('../business/services/GetClassesListUseCase');
const GetOverviewUseCase = require('../business/services/GetOverviewUseCase');
const ExportActivitiesUseCase = require('../business/services/ExportActivitiesUseCase');
const ExportRegistrationsUseCase = require('../business/services/ExportRegistrationsUseCase');
const AdminReportsController = require('./controllers/AdminReportsController');

function createAdminReportsController() {
  // Data layer
  const repo = adminReportsRepository;

  // Business layer (Use Cases)
  const useCases = {
    getUserPointsReport: new GetUserPointsReportUseCase(repo),
    getAttendanceReport: new GetAttendanceReportUseCase(repo),
    getClassesList: new GetClassesListUseCase(repo),
    getOverview: new GetOverviewUseCase(repo),
    exportActivities: new ExportActivitiesUseCase(repo),
    exportRegistrations: new ExportRegistrationsUseCase(repo)
  };

  // Presentation layer
  const controller = new AdminReportsController(useCases);

  return controller;
}

module.exports = { createAdminReportsController };

