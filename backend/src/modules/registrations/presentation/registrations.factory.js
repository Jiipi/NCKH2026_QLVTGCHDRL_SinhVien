const RegistrationPrismaRepository = require('../infrastructure/repositories/RegistrationPrismaRepository');
const ListRegistrationsUseCase = require('../application/use-cases/ListRegistrationsUseCase');
const GetRegistrationUseCase = require('../application/use-cases/GetRegistrationUseCase');
const CreateRegistrationUseCase = require('../application/use-cases/CreateRegistrationUseCase');
const UpdateRegistrationUseCase = require('../application/use-cases/UpdateRegistrationUseCase');
const DeleteRegistrationUseCase = require('../application/use-cases/DeleteRegistrationUseCase');
const ApproveRegistrationUseCase = require('../application/use-cases/ApproveRegistrationUseCase');
const RejectRegistrationUseCase = require('../application/use-cases/RejectRegistrationUseCase');
const BulkApproveRegistrationsUseCase = require('../application/use-cases/BulkApproveRegistrationsUseCase');
const GetMyRegistrationsUseCase = require('../application/use-cases/GetMyRegistrationsUseCase');
const GetActivityRegistrationStatsUseCase = require('../application/use-cases/GetActivityRegistrationStatsUseCase');
const CancelRegistrationUseCase = require('../application/use-cases/CancelRegistrationUseCase');
const CheckInRegistrationUseCase = require('../application/use-cases/CheckInRegistrationUseCase');
const RegistrationsController = require('./RegistrationsController');

/**
 * Factory function to create RegistrationsController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createRegistrationsController() {
  const registrationRepository = new RegistrationPrismaRepository();

  const useCases = {
    list: new ListRegistrationsUseCase(registrationRepository),
    get: new GetRegistrationUseCase(registrationRepository),
    create: new CreateRegistrationUseCase(registrationRepository),
    update: new UpdateRegistrationUseCase(registrationRepository),
    delete: new DeleteRegistrationUseCase(registrationRepository),
    approve: new ApproveRegistrationUseCase(registrationRepository),
    reject: new RejectRegistrationUseCase(registrationRepository),
    bulkApprove: new BulkApproveRegistrationsUseCase(registrationRepository),
    my: new GetMyRegistrationsUseCase(registrationRepository),
    stats: new GetActivityRegistrationStatsUseCase(registrationRepository),
    cancel: new CancelRegistrationUseCase(registrationRepository),
    checkIn: new CheckInRegistrationUseCase(registrationRepository)
  };

  return new RegistrationsController(useCases);
}

module.exports = { createRegistrationsController };

