const profileRepository = require('../data/repositories/profile.repository');
const GetProfileUseCase = require('../business/services/GetProfileUseCase');
const UpdateProfileUseCase = require('../business/services/UpdateProfileUseCase');
const ChangePasswordUseCase = require('../business/services/ChangePasswordUseCase');
const CheckClassMonitorUseCase = require('../business/services/CheckClassMonitorUseCase');
const ProfileController = require('./controllers/ProfileController');

/**
 * Factory for creating ProfileController with all dependencies
 * Implements Dependency Injection pattern
 */
function createProfileController() {
  // Data layer
  const repo = profileRepository;

  // Business layer (Use Cases)
  const useCases = {
    getProfile: new GetProfileUseCase(repo),
    updateProfile: new UpdateProfileUseCase(repo),
    changePassword: new ChangePasswordUseCase(repo),
    checkMonitorStatus: new CheckClassMonitorUseCase(repo)
  };

  // Presentation layer
  const controller = new ProfileController(useCases);

  return controller;
}

module.exports = { createProfileController };

