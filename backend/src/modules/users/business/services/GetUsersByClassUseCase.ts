import type { NguoiDung } from '@prisma/client';
import type IUserRepository from '../interfaces/IUserRepository';
import { ForbiddenError } from '../../../../core/errors/AppError';

interface AuthUser {
  id: string | number;
  role: string;
  class?: string;
}

/**
 * GetUsersByClassUseCase
 * Use case for getting users by class
 * Follows Single Responsibility Principle (SRP)
 */
class GetUsersByClassUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(className: string, user: AuthUser): Promise<Partial<NguoiDung>[]> {
    // Authorization
    if (user.role === 'SINH_VIEN') {
      throw new ForbiddenError('Bạn không có quyền xem danh sách lớp');
    }

    if (user.role === 'LOP_TRUONG' && user.class !== className) {
      throw new ForbiddenError('Bạn chỉ được xem lớp của mình');
    }

    const users = await this.userRepository.findByClass(className);

    // Remove passwords
    const result = users.map(u => {
      const userCopy = { ...u } as Partial<NguoiDung> & { password?: string };
      delete userCopy.password;
      return userCopy;
    });

    return result;
  }
}

export default GetUsersByClassUseCase;
module.exports = GetUsersByClassUseCase;
