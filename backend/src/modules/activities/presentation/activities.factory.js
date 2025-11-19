const ActivityPrismaRepository = require('../infrastructure/repositories/ActivityPrismaRepository');
const GetActivitiesUseCase = require('../application/use-cases/GetActivitiesUseCase');
const GetActivityByIdUseCase = require('../application/use-cases/GetActivityByIdUseCase');
const CreateActivityUseCase = require('../application/use-cases/CreateActivityUseCase');
const UpdateActivityUseCase = require('../application/use-cases/UpdateActivityUseCase');
const DeleteActivityUseCase = require('../application/use-cases/DeleteActivityUseCase');
const ApproveActivityUseCase = require('../application/use-cases/ApproveActivityUseCase');
const RejectActivityUseCase = require('../application/use-cases/RejectActivityUseCase');
const GetActivityDetailsUseCase = require('../application/use-cases/GetActivityDetailsUseCase');
const RegisterActivityUseCase = require('../application/use-cases/RegisterActivityUseCase');
const CancelActivityRegistrationUseCase = require('../application/use-cases/CancelActivityRegistrationUseCase');
const GetActivityQRDataUseCase = require('../application/use-cases/GetActivityQRDataUseCase');
const ScanAttendanceUseCase = require('../application/use-cases/ScanAttendanceUseCase');
const ActivitiesController = require('./ActivitiesController');

/**
 * Factory for creating ActivitiesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createActivitiesController() {
  // Infrastructure layer
  const activityRepository = new ActivityPrismaRepository();

  // Application layer (Use Cases)
  const getActivitiesUseCase = new GetActivitiesUseCase(activityRepository);
  const getActivityByIdUseCase = new GetActivityByIdUseCase(activityRepository);
  const createActivityUseCase = new CreateActivityUseCase(activityRepository);
  const updateActivityUseCase = new UpdateActivityUseCase(activityRepository);
  const deleteActivityUseCase = new DeleteActivityUseCase(activityRepository);
  const approveActivityUseCase = new ApproveActivityUseCase(activityRepository);
  const rejectActivityUseCase = new RejectActivityUseCase(activityRepository);
  const getActivityDetailsUseCase = new GetActivityDetailsUseCase(activityRepository);
  const registerActivityUseCase = new RegisterActivityUseCase();
  const cancelActivityRegistrationUseCase = new CancelActivityRegistrationUseCase();
  const getActivityQRDataUseCase = new GetActivityQRDataUseCase(activityRepository);
  const scanAttendanceUseCase = new ScanAttendanceUseCase(activityRepository);

  // Presentation layer
  const controller = new ActivitiesController(
    getActivitiesUseCase,
    getActivityByIdUseCase,
    createActivityUseCase,
    updateActivityUseCase,
    deleteActivityUseCase,
    approveActivityUseCase,
    rejectActivityUseCase,
    getActivityDetailsUseCase,
    registerActivityUseCase,
    cancelActivityRegistrationUseCase,
    getActivityQRDataUseCase,
    scanAttendanceUseCase
  );

  return controller;
}

module.exports = { createActivitiesController };

