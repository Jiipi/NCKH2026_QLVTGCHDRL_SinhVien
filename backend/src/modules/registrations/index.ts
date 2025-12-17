/**
 * Registrations Module - TypeScript Index
 */

// Types exports
export type {
  RegistrationStatusVN,
  RegistrationStatusEN,
  Registration,
  RegistrationWithRelations,
  CreateRegistrationDto as CreateRegistrationDtoType,
  UpdateRegistrationStatusDto,
  RegistrationDto,
  RegistrationFilterOptions,
  RegistrationQueryOptions,
  RegistrationIncludeOptions,
  PaginatedRegistrationsResult,
  IRegistrationsRepository,
  IGetRegistrationsUseCase,
  IGetRegistrationByIdUseCase,
  ICreateRegistrationUseCase,
  IUpdateRegistrationStatusUseCase,
  ICancelRegistrationUseCase,
  IRegistrationsController
} from './registrations.types';

// DTOs
export { CreateRegistrationDto } from './business/dto/CreateRegistrationDto';
export { ListRegistrationsDto } from './business/dto/ListRegistrationsDto';

// Helpers
export { checkAccess, canApproveRegistration, canManageActivity } from './business/helpers/registrationAccess';
export type { AuthUser, RegistrationForAccess, ActivityForAccess } from './business/helpers/registrationAccess';

// Interfaces
export type { 
  IRegistrationRepository,
  RegistrationIncludeOptions as RepoIncludeOptions,
  FindManyParams,
  FindManyResult,
  CreateRegistrationData,
  UpdateRegistrationData,
  UserRegistrationFilters,
  ActivityStats,
  BulkUpdateResult
} from './business/interfaces/IRegistrationRepository';

// Services / Use Cases
export { ApproveRegistrationUseCase } from './business/services/ApproveRegistrationUseCase';
export { BulkApproveRegistrationsUseCase } from './business/services/BulkApproveRegistrationsUseCase';
export { CancelRegistrationUseCase } from './business/services/CancelRegistrationUseCase';
export { CheckInRegistrationUseCase } from './business/services/CheckInRegistrationUseCase';
export { CreateRegistrationUseCase } from './business/services/CreateRegistrationUseCase';
export { DeleteRegistrationUseCase } from './business/services/DeleteRegistrationUseCase';
export { GetActivityRegistrationStatsUseCase } from './business/services/GetActivityRegistrationStatsUseCase';
export { GetMyRegistrationsUseCase } from './business/services/GetMyRegistrationsUseCase';
export { GetRegistrationUseCase } from './business/services/GetRegistrationUseCase';
export { ListRegistrationsUseCase } from './business/services/ListRegistrationsUseCase';
export { RegistrationApprovalService } from './business/services/RegistrationApprovalService';
export { RegistrationExportService } from './business/services/RegistrationExportService';
export { RejectRegistrationUseCase } from './business/services/RejectRegistrationUseCase';
export { UpdateRegistrationUseCase } from './business/services/UpdateRegistrationUseCase';

// Repository
export { default as registrationsRepository, RegistrationsRepository } from './data/repositories/registrations.repository';

// Controller
export { RegistrationsController } from './presentation/controllers/RegistrationsController';
export type { RegistrationUseCases } from './presentation/controllers/RegistrationsController';

// Factory
export { createRegistrationsController } from './presentation/registrations.factory';

// Routes
import routes from './presentation/routes/registrations.routes';
export { routes };

// CommonJS compatibility
module.exports = { routes };
