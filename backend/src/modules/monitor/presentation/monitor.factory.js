const MonitorPrismaRepository = require('../data/repositories/MonitorPrismaRepository');
const GetClassStudentsUseCase = require('../business/services/GetClassStudentsUseCase');
const GetPendingRegistrationsUseCase = require('../business/services/GetPendingRegistrationsUseCase');
const GetPendingRegistrationsCountUseCase = require('../business/services/GetPendingRegistrationsCountUseCase');
const ApproveRegistrationUseCase = require('../business/services/ApproveRegistrationUseCase');
const RejectRegistrationUseCase = require('../business/services/RejectRegistrationUseCase');
const GetMonitorDashboardUseCase = require('../business/services/GetMonitorDashboardUseCase');
const GetClassReportsUseCase = require('../business/services/GetClassReportsUseCase');
const MonitorController = require('./controllers/MonitorController');

/**
 * Factory for creating MonitorController with all dependencies
 * Implements Dependency Injection pattern
 */
function createMonitorController() {
  // Data layer
  const monitorRepository = new MonitorPrismaRepository();

  // Business layer (Use Cases)
  const useCases = {
    getClassStudents: new GetClassStudentsUseCase(monitorRepository),
    getPendingRegistrations: new GetPendingRegistrationsUseCase(monitorRepository),
    getPendingRegistrationsCount: new GetPendingRegistrationsCountUseCase(monitorRepository),
    approveRegistration: new ApproveRegistrationUseCase(monitorRepository),
    rejectRegistration: new RejectRegistrationUseCase(monitorRepository),
    getMonitorDashboard: new GetMonitorDashboardUseCase(monitorRepository),
    getClassReports: new GetClassReportsUseCase(monitorRepository)
  };

  // Presentation layer
  const controller = new MonitorController(useCases);

  return controller;
}

module.exports = { createMonitorController };

