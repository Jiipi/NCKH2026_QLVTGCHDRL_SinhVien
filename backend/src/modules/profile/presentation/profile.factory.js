const ProfilePrismaRepository = require('../infrastructure/repositories/ProfilePrismaRepository');
const GetProfileUseCase = require('../application/use-cases/GetProfileUseCase');
const UpdateProfileUseCase = require('../application/use-cases/UpdateProfileUseCase');
const ChangePasswordUseCase = require('../application/use-cases/ChangePasswordUseCase');
const CheckClassMonitorUseCase = require('../application/use-cases/CheckClassMonitorUseCase');
const ProfileController = require('./ProfileController');

/**
 * Factory for creating ProfileController with all dependencies
 * Implements Dependency Injection pattern
 */
function createProfileController() {
  // Infrastructure layer
  const profileRepository = new ProfilePrismaRepository();

  // Application layer (Use Cases)
  const useCases = {
    getProfile: new GetProfileUseCase(profileRepository),
    updateProfile: new UpdateProfileUseCase(profileRepository),
    changePassword: new ChangePasswordUseCase(profileRepository),
    checkMonitorStatus: new CheckClassMonitorUseCase(profileRepository)
  };

  // Presentation layer
  const controller = new ProfileController(useCases);

  return controller;
}

module.exports = { createProfileController };

