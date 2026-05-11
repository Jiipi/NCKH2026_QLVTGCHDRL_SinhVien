import { PrismaClient } from '@prisma/client';

// Import repositories
import { activitiesRepository } from '../data/repositories/activities.repository';
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
import CreateAttendanceFallbackRequestUseCaseModule from '../business/services/CreateAttendanceFallbackRequestUseCase';
import ListAttendanceFallbackRequestsUseCaseModule from '../business/services/ListAttendanceFallbackRequestsUseCase';
import ApproveAttendanceFallbackRequestUseCaseModule from '../business/services/ApproveAttendanceFallbackRequestUseCase';
import RejectAttendanceFallbackRequestUseCaseModule from '../business/services/RejectAttendanceFallbackRequestUseCase';
import CancelAttendanceFallbackRequestUseCaseModule from '../business/services/CancelAttendanceFallbackRequestUseCase';

// Import controller
import ActivitiesControllerModule from './controllers/ActivitiesController';

// Import use cases from registrations module
import CreateRegistrationUseCaseModule from '../../registrations/business/services/CreateRegistrationUseCase';
import CancelRegistrationUseCaseModule from '../../registrations/business/services/CancelRegistrationUseCase';

// Handle ES module interop (TypeScript files may export { default: Class })
type ModuleWithDefault<T> = T & { default?: T };
function resolveDefault<T>(mod: ModuleWithDefault<T>): T {
  return (mod as ModuleWithDefault<T>).default || mod;
}

const GetActivitiesUseCase = resolveDefault(GetActivitiesUseCaseModule);
const GetActivityByIdUseCase = resolveDefault(GetActivityByIdUseCaseModule);
const CreateActivityUseCase = resolveDefault(CreateActivityUseCaseModule);
const UpdateActivityUseCase = resolveDefault(UpdateActivityUseCaseModule);
const DeleteActivityUseCase = resolveDefault(DeleteActivityUseCaseModule);
const ApproveActivityUseCase = resolveDefault(ApproveActivityUseCaseModule);
const RejectActivityUseCase = resolveDefault(RejectActivityUseCaseModule);
const GetActivityDetailsUseCase = resolveDefault(GetActivityDetailsUseCaseModule);
const RegisterActivityUseCase = resolveDefault(RegisterActivityUseCaseModule);
const CancelActivityRegistrationUseCase = resolveDefault(CancelActivityRegistrationUseCaseModule);
const GetActivityQRDataUseCase = resolveDefault(GetActivityQRDataUseCaseModule);
const ScanAttendanceUseCase = resolveDefault(ScanAttendanceUseCaseModule);
const CreateAttendanceFallbackRequestUseCase = resolveDefault(CreateAttendanceFallbackRequestUseCaseModule);
const ListAttendanceFallbackRequestsUseCase = resolveDefault(ListAttendanceFallbackRequestsUseCaseModule);
const ApproveAttendanceFallbackRequestUseCase = resolveDefault(ApproveAttendanceFallbackRequestUseCaseModule);
const RejectAttendanceFallbackRequestUseCase = resolveDefault(RejectAttendanceFallbackRequestUseCaseModule);
const CancelAttendanceFallbackRequestUseCase = resolveDefault(CancelAttendanceFallbackRequestUseCaseModule);
const ActivitiesController = resolveDefault(ActivitiesControllerModule);
const CreateRegistrationUseCase = resolveDefault(CreateRegistrationUseCaseModule);
const CancelRegistrationUseCase = resolveDefault(CancelRegistrationUseCaseModule);

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
    cancelRegistration: new CancelActivityRegistrationUseCase(cancelRegistrationUseCase, repo),
    getQRData: new GetActivityQRDataUseCase(repo),
    scanAttendance: new ScanAttendanceUseCase(repo),
    createFallbackRequest: new CreateAttendanceFallbackRequestUseCase(repo),
    listFallbackRequests: new ListAttendanceFallbackRequestsUseCase(repo),
    approveFallbackRequest: new ApproveAttendanceFallbackRequestUseCase(repo),
    rejectFallbackRequest: new RejectAttendanceFallbackRequestUseCase(repo),
    cancelFallbackRequest: new CancelAttendanceFallbackRequestUseCase(repo)
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
