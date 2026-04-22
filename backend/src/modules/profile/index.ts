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

import routes from './presentation/routes/profile.routes';
export { routes };
module.exports = { routes };
