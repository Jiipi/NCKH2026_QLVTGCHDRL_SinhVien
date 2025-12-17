/**
 * Profile Module - TypeScript Index
 */

export type {
  UserWithProfile,
  StudentWithMonitorInfo,
  ClassWithMonitor,
  UpdateProfileDto,
  ChangePasswordDto,
  ProfileDto,
  IProfileRepository,
  IGetProfileUseCase,
  IUpdateProfileUseCase,
  IChangePasswordUseCase,
  IUploadAvatarUseCase,
  IProfileController
} from './profile.types';

const routes = require('./presentation/routes/profile.routes');
export { routes };
module.exports = { routes };
