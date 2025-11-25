const registrationsRepository = require('../data/repositories/registrations.repository');
const ListRegistrationsUseCase = require('../business/services/ListRegistrationsUseCase');
const GetRegistrationUseCase = require('../business/services/GetRegistrationUseCase');
const CreateRegistrationUseCase = require('../business/services/CreateRegistrationUseCase');
const UpdateRegistrationUseCase = require('../business/services/UpdateRegistrationUseCase');
const DeleteRegistrationUseCase = require('../business/services/DeleteRegistrationUseCase');
const ApproveRegistrationUseCase = require('../business/services/ApproveRegistrationUseCase');
const RejectRegistrationUseCase = require('../business/services/RejectRegistrationUseCase');
const BulkApproveRegistrationsUseCase = require('../business/services/BulkApproveRegistrationsUseCase');
const GetMyRegistrationsUseCase = require('../business/services/GetMyRegistrationsUseCase');
const GetActivityRegistrationStatsUseCase = require('../business/services/GetActivityRegistrationStatsUseCase');
const CancelRegistrationUseCase = require('../business/services/CancelRegistrationUseCase');
const CheckInRegistrationUseCase = require('../business/services/CheckInRegistrationUseCase');
const RegistrationsController = require('./controllers/RegistrationsController');

/**
 * Factory function to create RegistrationsController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createRegistrationsController() {
  const repo = registrationsRepository;

  const useCases = {
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

module.exports = { createRegistrationsController };

