import { PrismaClient } from '@prisma/client';

// Import repositories
import activitiesRepository from '../data/repositories/activities.repository';
import registrationsRepository from '../../registrations/data/repositories/registrations.repository';

// Import use cases from activities module
import GetActivitiesUseCaseModule from '../business/services/GetActivitiesUseCase';
import GetActivityByIdUseCaseModule from '../business/services/GetActivityByIdUseCase';
import CreateActivityUseCaseModule from '../business/services/CreateActivityUseCase';
import UpdateActivityUseCaseModule from '../business/services/UpdateActivityUseCase';
import DeleteActivityUseCaseModule from '../business/services/DeleteActivityUseCase';
import ApproveActivityUseCaseModule from '../business/services/ApproveActivityUseCase';
import RejectActivityUseCaseModule from '../business/services/RejectActivityUseCase';
import GetActivityDetailsUseCaseModule from '../business/services/GetActivityDetailsUseCase';
import RegisterActivityUseCaseModule from '../business/services/RegisterActivityUseCase';
import CancelActivityRegistrationUseCaseModule from '../business/services/CancelActivityRegistrationUseCase';
import GetActivityQRDataUseCaseModule from '../business/services/GetActivityQRDataUseCase';
import ScanAttendanceUseCaseModule from '../business/services/ScanAttendanceUseCase';

// Import controller
import ActivitiesControllerModule from './controllers/ActivitiesController';

// Import use cases from registrations module
import CreateRegistrationUseCaseModule from '../../registrations/business/services/CreateRegistrationUseCase';
import CancelRegistrationUseCaseModule from '../../registrations/business/services/CancelRegistrationUseCase';

// Handle ES module interop (TypeScript files may export { default: Class })
const GetActivitiesUseCase = (GetActivitiesUseCaseModule as any).default || GetActivitiesUseCaseModule;
const GetActivityByIdUseCase = (GetActivityByIdUseCaseModule as any).default || GetActivityByIdUseCaseModule;
const CreateActivityUseCase = (CreateActivityUseCaseModule as any).default || CreateActivityUseCaseModule;
const UpdateActivityUseCase = (UpdateActivityUseCaseModule as any).default || UpdateActivityUseCaseModule;
const DeleteActivityUseCase = (DeleteActivityUseCaseModule as any).default || DeleteActivityUseCaseModule;
const ApproveActivityUseCase = (ApproveActivityUseCaseModule as any).default || ApproveActivityUseCaseModule;
const RejectActivityUseCase = (RejectActivityUseCaseModule as any).default || RejectActivityUseCaseModule;
const GetActivityDetailsUseCase = (GetActivityDetailsUseCaseModule as any).default || GetActivityDetailsUseCaseModule;
const RegisterActivityUseCase = (RegisterActivityUseCaseModule as any).default || RegisterActivityUseCaseModule;
const CancelActivityRegistrationUseCase = (CancelActivityRegistrationUseCaseModule as any).default || CancelActivityRegistrationUseCaseModule;
const GetActivityQRDataUseCase = (GetActivityQRDataUseCaseModule as any).default || GetActivityQRDataUseCaseModule;
const ScanAttendanceUseCase = (ScanAttendanceUseCaseModule as any).default || ScanAttendanceUseCaseModule;
const ActivitiesController = (ActivitiesControllerModule as any).default || ActivitiesControllerModule;
const CreateRegistrationUseCase = (CreateRegistrationUseCaseModule as any).default || CreateRegistrationUseCaseModule;
const CancelRegistrationUseCase = (CancelRegistrationUseCaseModule as any).default || CancelRegistrationUseCaseModule;

/**
 * Factory for creating ActivitiesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createActivitiesController(): InstanceType<typeof ActivitiesController> {
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

export default createActivitiesController;
export { createActivitiesController };

// CommonJS compatibility
module.exports = createActivitiesController;
module.exports.createActivitiesController = createActivitiesController;
