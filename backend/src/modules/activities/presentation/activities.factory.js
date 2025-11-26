const activitiesRepository = require('../data/repositories/activities.repository');
const GetActivitiesUseCase = require('../business/services/GetActivitiesUseCase');
const GetActivityByIdUseCase = require('../business/services/GetActivityByIdUseCase');
const CreateActivityUseCase = require('../business/services/CreateActivityUseCase');
const UpdateActivityUseCase = require('../business/services/UpdateActivityUseCase');
const DeleteActivityUseCase = require('../business/services/DeleteActivityUseCase');
const ApproveActivityUseCase = require('../business/services/ApproveActivityUseCase');
const RejectActivityUseCase = require('../business/services/RejectActivityUseCase');
const GetActivityDetailsUseCase = require('../business/services/GetActivityDetailsUseCase');
const RegisterActivityUseCase = require('../business/services/RegisterActivityUseCase');
const CancelActivityRegistrationUseCase = require('../business/services/CancelActivityRegistrationUseCase');
const GetActivityQRDataUseCase = require('../business/services/GetActivityQRDataUseCase');
const ScanAttendanceUseCase = require('../business/services/ScanAttendanceUseCase');
const ActivitiesController = require('./controllers/ActivitiesController');

// Import use cases from registrations module
const registrationsRepository = require('../../registrations/data/repositories/registrations.repository');
const CreateRegistrationUseCase = require('../../registrations/business/services/CreateRegistrationUseCase');
const CancelRegistrationUseCase = require('../../registrations/business/services/CancelRegistrationUseCase');

/**
 * Factory for creating ActivitiesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createActivitiesController() {
  // Data layer
  const repo = activitiesRepository;

  // Registrations module use cases
  const createRegistrationUseCase = new CreateRegistrationUseCase(registrationsRepository);
  const cancelRegistrationUseCase = new CancelRegistrationUseCase(registrationsRepository);

  // Business layer (Use Cases)
  const useCases = {
    getAll: new GetActivitiesUseCase(repo),
    getById: new GetActivityByIdUseCase(repo),
    create: new CreateActivityUseCase(repo),
    update: new UpdateActivityUseCase(repo),
    delete: new DeleteActivityUseCase(repo),
    approve: new ApproveActivityUseCase(repo),
    reject: new RejectActivityUseCase(repo),
    getDetails: new GetActivityDetailsUseCase(repo),
    register: new RegisterActivityUseCase(createRegistrationUseCase, repo),
    cancelRegistration: new CancelActivityRegistrationUseCase(cancelRegistrationUseCase),
    getQRData: new GetActivityQRDataUseCase(repo),
    scanAttendance: new ScanAttendanceUseCase(repo)
  };

  // Presentation layer
  const controller = new ActivitiesController(useCases);

  return controller;
}

module.exports = { createActivitiesController };

