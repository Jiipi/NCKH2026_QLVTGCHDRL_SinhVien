const TeacherPrismaRepository = require('../data/repositories/TeacherPrismaRepository');
const GetTeacherDashboardUseCase = require('../business/services/GetTeacherDashboardUseCase');
const GetTeacherClassesUseCase = require('../business/services/GetTeacherClassesUseCase');
const GetTeacherStudentsUseCase = require('../business/services/GetTeacherStudentsUseCase');
const GetPendingActivitiesUseCase = require('../business/services/GetPendingActivitiesUseCase');
const GetActivityHistoryUseCase = require('../business/services/GetActivityHistoryUseCase');
const ApproveActivityUseCase = require('../business/services/ApproveActivityUseCase');
const RejectActivityUseCase = require('../business/services/RejectActivityUseCase');
const GetAllRegistrationsUseCase = require('../business/services/GetAllRegistrationsUseCase');
const GetPendingRegistrationsUseCase = require('../business/services/GetPendingRegistrationsUseCase');
const ApproveRegistrationUseCase = require('../business/services/ApproveRegistrationUseCase');
const RejectRegistrationUseCase = require('../business/services/RejectRegistrationUseCase');
const BulkApproveRegistrationsUseCase = require('../business/services/BulkApproveRegistrationsUseCase');
const GetClassStatisticsUseCase = require('../business/services/GetClassStatisticsUseCase');
const AssignClassMonitorUseCase = require('../business/services/AssignClassMonitorUseCase');
const CreateStudentUseCase = require('../business/services/CreateStudentUseCase');
const ExportStudentsUseCase = require('../business/services/ExportStudentsUseCase');
const GetReportStatisticsUseCase = require('../business/services/GetReportStatisticsUseCase');
const TeachersController = require('./controllers/TeachersController');

// Import use cases from activities module
const activitiesRepository = require('../../activities/data/repositories/activities.repository');
const GetActivitiesUseCase = require('../../activities/business/services/GetActivitiesUseCase');
const ApproveActivityUseCaseFromActivities = require('../../activities/business/services/ApproveActivityUseCase');
const RejectActivityUseCaseFromActivities = require('../../activities/business/services/RejectActivityUseCase');

// Import use cases from registrations module
const registrationsRepository = require('../../registrations/data/repositories/registrations.repository');
const ListRegistrationsUseCase = require('../../registrations/business/services/ListRegistrationsUseCase');
const ApproveRegistrationUseCaseFromRegistrations = require('../../registrations/business/services/ApproveRegistrationUseCase');
const RejectRegistrationUseCaseFromRegistrations = require('../../registrations/business/services/RejectRegistrationUseCase');
const BulkApproveRegistrationsUseCaseFromRegistrations = require('../../registrations/business/services/BulkApproveRegistrationsUseCase');

/**
 * Factory for creating TeachersController with all dependencies
 * Implements Dependency Injection pattern
 */
function createTeachersController() {
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
  
  const useCases = {
    getDashboard: new GetTeacherDashboardUseCase(teacherRepository, listRegistrationsUseCase),
    getClasses: new GetTeacherClassesUseCase(teacherRepository),
    getStudents: new GetTeacherStudentsUseCase(teacherRepository),
    getPendingActivities: new GetPendingActivitiesUseCase(getActivitiesUseCase),
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

module.exports = { createTeachersController };

