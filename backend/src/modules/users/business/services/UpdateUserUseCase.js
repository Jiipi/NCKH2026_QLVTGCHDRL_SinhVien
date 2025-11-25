const UpdateUserDto = require('../dto/UpdateUserDto');
const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');
const bcrypt = require('bcryptjs');
const usersRepo = require('../../data/repositories/users.repository');

/**
 * UpdateUserUseCase
 * Use case for updating a user
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, dto, user) {
    const targetUser = await usersRepo.findById(id);

    if (!targetUser) {
      throw new NotFoundError('User không tồn tại');
    }

    // Authorization check
    const canUpdate = user.role === 'ADMIN' || parseInt(id) === user.id;
    if (!canUpdate) {
      throw new ForbiddenError('Bạn không có quyền cập nhật user này');
    }

    // Non-admin cannot change role
    if (dto.role && user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được thay đổi role');
    }

    // Hash password if provided
    const updateData = dto.toUpdateData();
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update
    const updated = await this.userRepository.update(id, updateData);

    // Remove password from response
    delete updated.password;

    return updated;
  }
}

module.exports = UpdateUserUseCase;

