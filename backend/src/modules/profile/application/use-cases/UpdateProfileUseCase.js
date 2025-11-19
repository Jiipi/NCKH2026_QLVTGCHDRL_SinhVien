const { NotFoundError, ValidationError } = require('../../../../core/errors/AppError');
const UpdateProfileDto = require('../dto/UpdateProfileDto');

/**
 * UpdateProfileUseCase
 * Use case for updating user profile
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateProfileUseCase {
  constructor(profileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(userId, data) {
    const validatedData = UpdateProfileDto.fromRequest(data);

    const existingUser = await this.profileRepository.findUserById(userId);

    if (!existingUser) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // If email is being updated, check if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await this.profileRepository.findByEmail(validatedData.email, userId);

      if (emailExists) {
        throw new ValidationError('Email đã được sử dụng');
      }
    }

    // Update user
    const updatedUser = await this.profileRepository.updateUser(userId, validatedData);

    // Remove sensitive data
    const { mat_khau, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}

module.exports = UpdateProfileUseCase;

