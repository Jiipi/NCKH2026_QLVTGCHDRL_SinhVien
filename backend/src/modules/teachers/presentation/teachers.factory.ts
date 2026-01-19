/**
 * Teachers Factory
 * Factory for creating TeachersController with all dependencies
 * Implements Dependency Injection pattern
 */

import TeacherPrismaRepository from '../data/repositories/TeacherPrismaRepository';
import GetTeacherDashboardUseCase from '../business/services/GetTeacherDashboardUseCase';
import GetTeacherClassesUseCase from '../business/services/GetTeacherClassesUseCase';
import GetTeacherStudentsUseCase from '../business/services/GetTeacherStudentsUseCase';
import GetPendingActivitiesUseCase from '../business/services/GetPendingActivitiesUseCase';
import GetActivityHistoryUseCase from '../business/services/GetActivityHistoryUseCase';
import ApproveActivityUseCase from '../business/services/ApproveActivityUseCase';
import RejectActivityUseCase from '../business/services/RejectActivityUseCase';
import GetAllRegistrationsUseCase from '../business/services/GetAllRegistrationsUseCase';
import GetPendingRegistrationsUseCase from '../business/services/GetPendingRegistrationsUseCase';
import ApproveRegistrationUseCase from '../business/services/ApproveRegistrationUseCase';
import RejectRegistrationUseCase from '../business/services/RejectRegistrationUseCase';
import BulkApproveRegistrationsUseCase from '../business/services/BulkApproveRegistrationsUseCase';
import GetClassStatisticsUseCase from '../business/services/GetClassStatisticsUseCase';
import AssignClassMonitorUseCase from '../business/services/AssignClassMonitorUseCase';
import CreateStudentUseCase from '../business/services/CreateStudentUseCase';
import ExportStudentsUseCase from '../business/services/ExportStudentsUseCase';
import GetReportStatisticsUseCase from '../business/services/GetReportStatisticsUseCase';
import TeachersController from './controllers/TeachersController';

// Import use cases from activities module
import { activitiesRepository } from '../../activities/data/repositories/activities.repository';
import GetActivitiesUseCase from '../../activities/business/services/GetActivitiesUseCase';
import ApproveActivityUseCaseFromActivities from '../../activities/business/services/ApproveActivityUseCase';
import RejectActivityUseCaseFromActivities from '../../activities/business/services/RejectActivityUseCase';

// Import use cases from registrations module
import registrationsRepository from '../../registrations/data/repositories/registrations.repository';
import ListRegistrationsUseCase from '../../registrations/business/services/ListRegistrationsUseCase';
import ApproveRegistrationUseCaseFromRegistrations from '../../registrations/business/services/ApproveRegistrationUseCase';
import RejectRegistrationUseCaseFromRegistrations from '../../registrations/business/services/RejectRegistrationUseCase';
import BulkApproveRegistrationsUseCaseFromRegistrations from '../../registrations/business/services/BulkApproveRegistrationsUseCase';

/**
 * Factory for creating TeachersController with all dependencies
 * Implements Dependency Injection pattern
 */
export function createTeachersController(): TeachersController {
  // Data layer
  const teacherRepository = new TeacherPrismaRepository();

  // Activities module use cases
  const getActivitiesUseCase = new GetActivitiesUseCase(activitiesRepository);
  const approveActivityUseCaseFromActivities = new ApproveActivityUseCaseFromActivities(activitiesRepository);
  const rejectActivityUseCaseFromActivities = new RejectActivityUseCaseFromActivities(activitiesRepository);

  // Registrations module use cases
  const listRegistrationsUseCase = new ListRegistrationsUseCase(registrationsRepository);
  const approveRegistrationUseCaseFromRegistrations = new ApproveRegistrationUseCaseFromRegistrations(registrationsRepository);
  const rejectRegistrationUseCaseFromRegistrations = new RejectRegistrationUseCaseFromRegistrations(registrationsRepository);
  const bulkApproveRegistrationsUseCaseFromRegistrations = new BulkApproveRegistrationsUseCaseFromRegistrations(registrationsRepository);

  // Business layer (Use Cases)
  const getAllRegistrationsUseCase = new GetAllRegistrationsUseCase(teacherRepository);
  const pendingActivitiesUseCase = new GetPendingActivitiesUseCase(getActivitiesUseCase);
  
  const useCases = {
    getDashboard: new GetTeacherDashboardUseCase(teacherRepository, listRegistrationsUseCase, pendingActivitiesUseCase),
    getClasses: new GetTeacherClassesUseCase(teacherRepository),
    getStudents: new GetTeacherStudentsUseCase(teacherRepository),
    getPendingActivities: pendingActivitiesUseCase,
    getActivityHistory: new GetActivityHistoryUseCase(getActivitiesUseCase),
    approveActivity: new ApproveActivityUseCase(approveActivityUseCaseFromActivities),
    rejectActivity: new RejectActivityUseCase(rejectActivityUseCaseFromActivities),
    getAllRegistrations: getAllRegistrationsUseCase,
    getPendingRegistrations: new GetPendingRegistrationsUseCase(getAllRegistrationsUseCase, listRegistrationsUseCase),
    approveRegistration: new ApproveRegistrationUseCase(approveRegistrationUseCaseFromRegistrations),
    rejectRegistration: new RejectRegistrationUseCase(rejectRegistrationUseCaseFromRegistrations),
    bulkApproveRegistrations: new BulkApproveRegistrationsUseCase(bulkApproveRegistrationsUseCaseFromRegistrations),
    getClassStatistics: new GetClassStatisticsUseCase(teacherRepository),
    assignClassMonitor: new AssignClassMonitorUseCase(teacherRepository),
    createStudent: new CreateStudentUseCase(teacherRepository),
    exportStudents: new ExportStudentsUseCase(teacherRepository),
    getReportStatistics: new GetReportStatisticsUseCase(teacherRepository)
  };

  // Presentation layer
  const controller = new TeachersController(useCases);

  return controller;
}

export default { createTeachersController };
