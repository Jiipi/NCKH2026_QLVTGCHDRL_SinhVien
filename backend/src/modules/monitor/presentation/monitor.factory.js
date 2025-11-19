const MonitorPrismaRepository = require('../infrastructure/repositories/MonitorPrismaRepository');
const GetClassStudentsUseCase = require('../application/use-cases/GetClassStudentsUseCase');
const GetPendingRegistrationsUseCase = require('../application/use-cases/GetPendingRegistrationsUseCase');
const GetPendingRegistrationsCountUseCase = require('../application/use-cases/GetPendingRegistrationsCountUseCase');
const ApproveRegistrationUseCase = require('../application/use-cases/ApproveRegistrationUseCase');
const RejectRegistrationUseCase = require('../application/use-cases/RejectRegistrationUseCase');
const GetMonitorDashboardUseCase = require('../application/use-cases/GetMonitorDashboardUseCase');
const GetClassReportsUseCase = require('../application/use-cases/GetClassReportsUseCase');
const MonitorController = require('./MonitorController');

/**
 * Factory for creating MonitorController with all dependencies
 * Implements Dependency Injection pattern
 */
function createMonitorController() {
  // Infrastructure layer
  const monitorRepository = new MonitorPrismaRepository();

  // Application layer (Use Cases)
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

