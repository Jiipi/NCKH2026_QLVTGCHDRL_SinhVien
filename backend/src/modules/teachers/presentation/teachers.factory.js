const TeacherPrismaRepository = require('../infrastructure/repositories/TeacherPrismaRepository');
const GetTeacherDashboardUseCase = require('../application/use-cases/GetTeacherDashboardUseCase');
const GetTeacherClassesUseCase = require('../application/use-cases/GetTeacherClassesUseCase');
const GetTeacherStudentsUseCase = require('../application/use-cases/GetTeacherStudentsUseCase');
const GetPendingActivitiesUseCase = require('../application/use-cases/GetPendingActivitiesUseCase');
const GetActivityHistoryUseCase = require('../application/use-cases/GetActivityHistoryUseCase');
const ApproveActivityUseCase = require('../application/use-cases/ApproveActivityUseCase');
const RejectActivityUseCase = require('../application/use-cases/RejectActivityUseCase');
const GetAllRegistrationsUseCase = require('../application/use-cases/GetAllRegistrationsUseCase');
const GetPendingRegistrationsUseCase = require('../application/use-cases/GetPendingRegistrationsUseCase');
const ApproveRegistrationUseCase = require('../application/use-cases/ApproveRegistrationUseCase');
const RejectRegistrationUseCase = require('../application/use-cases/RejectRegistrationUseCase');
const BulkApproveRegistrationsUseCase = require('../application/use-cases/BulkApproveRegistrationsUseCase');
const GetClassStatisticsUseCase = require('../application/use-cases/GetClassStatisticsUseCase');
const AssignClassMonitorUseCase = require('../application/use-cases/AssignClassMonitorUseCase');
const CreateStudentUseCase = require('../application/use-cases/CreateStudentUseCase');
const ExportStudentsUseCase = require('../application/use-cases/ExportStudentsUseCase');
const GetReportStatisticsUseCase = require('../application/use-cases/GetReportStatisticsUseCase');
const TeachersController = require('./TeachersController');

/**
 * Factory for creating TeachersController with all dependencies
 * Implements Dependency Injection pattern
 */
function createTeachersController() {
  // Infrastructure layer
  const teacherRepository = new TeacherPrismaRepository();

  // Application layer (Use Cases)
  const getAllRegistrationsUseCase = new GetAllRegistrationsUseCase(teacherRepository);
  
  const useCases = {
    getDashboard: new GetTeacherDashboardUseCase(teacherRepository),
    getClasses: new GetTeacherClassesUseCase(teacherRepository),
    getStudents: new GetTeacherStudentsUseCase(teacherRepository),
    getPendingActivities: new GetPendingActivitiesUseCase(),
    getActivityHistory: new GetActivityHistoryUseCase(),
    approveActivity: new ApproveActivityUseCase(),
    rejectActivity: new RejectActivityUseCase(),
    getAllRegistrations: getAllRegistrationsUseCase,
    getPendingRegistrations: new GetPendingRegistrationsUseCase(getAllRegistrationsUseCase),
    approveRegistration: new ApproveRegistrationUseCase(),
    rejectRegistration: new RejectRegistrationUseCase(),
    bulkApproveRegistrations: new BulkApproveRegistrationsUseCase(),
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

module.exports = { createTeachersController };

