import type { DangKyHoatDong, SinhVien, HoatDong, Lop, TrangThaiDangKy } from '@prisma/client';

import MonitorPrismaRepository from '../data/repositories/MonitorPrismaRepository';
import GetClassStudentsUseCase from '../business/services/GetClassStudentsUseCase';
import GetPendingRegistrationsUseCase from '../business/services/GetPendingRegistrationsUseCase';
import GetPendingRegistrationsCountUseCase from '../business/services/GetPendingRegistrationsCountUseCase';
import ApproveRegistrationUseCase from '../business/services/ApproveRegistrationUseCase';
import RejectRegistrationUseCase from '../business/services/RejectRegistrationUseCase';
import GetMonitorDashboardUseCase from '../business/services/GetMonitorDashboardUseCase';
import GetClassReportsUseCase from '../business/services/GetClassReportsUseCase';
import MonitorController from './controllers/MonitorController';

/**
 * Factory for creating MonitorController with all dependencies
 * Implements Dependency Injection pattern
 */
function createMonitorController(): MonitorController {
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

export { createMonitorController };
module.exports = { createMonitorController };
