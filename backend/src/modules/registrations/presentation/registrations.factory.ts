/**
 * Registrations Factory
 * Factory function to create RegistrationsController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */

import registrationsRepository from '../data/repositories/registrations.repository';
import ListRegistrationsUseCase from '../business/services/ListRegistrationsUseCase';
import GetRegistrationUseCase from '../business/services/GetRegistrationUseCase';
import CreateRegistrationUseCase from '../business/services/CreateRegistrationUseCase';
import UpdateRegistrationUseCase from '../business/services/UpdateRegistrationUseCase';
import DeleteRegistrationUseCase from '../business/services/DeleteRegistrationUseCase';
import ApproveRegistrationUseCase from '../business/services/ApproveRegistrationUseCase';
import RejectRegistrationUseCase from '../business/services/RejectRegistrationUseCase';
import BulkApproveRegistrationsUseCase from '../business/services/BulkApproveRegistrationsUseCase';
import GetMyRegistrationsUseCase from '../business/services/GetMyRegistrationsUseCase';
import GetActivityRegistrationStatsUseCase from '../business/services/GetActivityRegistrationStatsUseCase';
import CancelRegistrationUseCase from '../business/services/CancelRegistrationUseCase';
import CheckInRegistrationUseCase from '../business/services/CheckInRegistrationUseCase';
import { RegistrationsController, RegistrationUseCases } from './controllers/RegistrationsController';
import type { IRegistrationRepository } from '../business/interfaces/IRegistrationRepository';

/**
 * Create RegistrationsController with all dependencies
 */
export function createRegistrationsController(): RegistrationsController {
  const repo: IRegistrationRepository = registrationsRepository;

  const useCases: RegistrationUseCases = {
    list: new ListRegistrationsUseCase(repo),
    get: new GetRegistrationUseCase(repo),
    create: new CreateRegistrationUseCase(repo),
    update: new UpdateRegistrationUseCase(repo),
    delete: new DeleteRegistrationUseCase(repo),
    approve: new ApproveRegistrationUseCase(repo),
    reject: new RejectRegistrationUseCase(repo),
    bulkApprove: new BulkApproveRegistrationsUseCase(repo),
    my: new GetMyRegistrationsUseCase(repo),
    stats: new GetActivityRegistrationStatsUseCase(repo),
    cancel: new CancelRegistrationUseCase(repo),
    checkIn: new CheckInRegistrationUseCase(repo)
  };

  return new RegistrationsController(useCases);
}

export { createRegistrationsController as default };
