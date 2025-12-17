import profileRepository from '../data/repositories/profile.repository';
import GetProfileUseCase from '../business/services/GetProfileUseCase';
import UpdateProfileUseCase from '../business/services/UpdateProfileUseCase';
import ChangePasswordUseCase from '../business/services/ChangePasswordUseCase';
import CheckClassMonitorUseCase from '../business/services/CheckClassMonitorUseCase';
import ProfileController, { type ProfileUseCases } from './controllers/ProfileController';

/**
 * Factory for creating ProfileController with all dependencies
 * Implements Dependency Injection pattern
 */
function createProfileController(): ProfileController {
  // Data layer
  const repo = profileRepository;

  // Business layer (Use Cases)
  const useCases: ProfileUseCases = {
    getProfile: new GetProfileUseCase(repo),
    updateProfile: new UpdateProfileUseCase(repo),
    changePassword: new ChangePasswordUseCase(repo),
    checkMonitorStatus: new CheckClassMonitorUseCase(repo)
  };

  // Presentation layer
  const controller = new ProfileController(useCases);

  return controller;
}

export { createProfileController };
module.exports = { createProfileController };
