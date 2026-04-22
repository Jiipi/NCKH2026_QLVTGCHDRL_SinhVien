import type { NguoiDung } from '@prisma/client';
import type IUserRepository from '../interfaces/IUserRepository';
import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import usersRepo from '../../data/repositories/users.repository';

interface AuthUser {
  id: string | number;
  role: string;
  class?: string;
}

interface UserResult {
  id: string | number;
  mssv: string;
  fullName: string;
  email: string;
  role: string;
  class: string;
  major: string;
  faculty: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * GetUserByIdUseCase
 * Use case for getting a user by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetUserByIdUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string, user: AuthUser): Promise<Partial<NguoiDung>> {
    const targetUser = await usersRepo.findById(id, {
      id: true,
      mssv: true,
      fullName: true,
      email: true,
      role: true,
      class: true,
      major: true,
      faculty: true,
      phone: true,
      address: true,
      isActive: true,
      createdAt: true
    });

    if (!targetUser) {
      throw new NotFoundError('User không tồn tại');
    }

    // Check authorization
    await this.checkAccess(targetUser, user);

    return targetUser;
  }

  async checkAccess(targetUser: Partial<NguoiDung> & { class?: string }, user: AuthUser): Promise<boolean> {
    if (user.role === 'ADMIN') return true;
    if (targetUser.id === user.id) return true;
    if (user.role === 'LOP_TRUONG' && targetUser.class === user.class) return true;
    if (user.role === 'GIANG_VIEN') return true;
    throw new ForbiddenError('Bạn không có quyền xem user này');
  }
}

export default GetUserByIdUseCase;
module.exports = GetUserByIdUseCase;
