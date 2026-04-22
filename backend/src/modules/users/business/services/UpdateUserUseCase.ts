import type { NguoiDung } from '@prisma/client';
import type IUserRepository from '../interfaces/IUserRepository';
import type { UserUpdateInput } from '../interfaces/IUserRepository';
import UpdateUserDto from '../dto/UpdateUserDto';
import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import bcrypt from 'bcryptjs';
import usersRepo from '../../data/repositories/users.repository';

interface AuthUser {
  id: string | number;
  role: string;
}

interface UpdateUserDtoType {
  role?: string;
  toUpdateData(): Record<string, unknown> & { password?: string };
}

/**
 * UpdateUserUseCase
 * Use case for updating a user
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string, dto: UpdateUserDtoType, user: AuthUser): Promise<Partial<NguoiDung>> {
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
    const updated = await this.userRepository.update(id, updateData as unknown as UserUpdateInput);

    // Remove password from response
    const result = { ...updated } as Partial<NguoiDung> & { password?: string };
    delete result.password;

    return result;
  }
}

export default UpdateUserUseCase;
module.exports = UpdateUserUseCase;
