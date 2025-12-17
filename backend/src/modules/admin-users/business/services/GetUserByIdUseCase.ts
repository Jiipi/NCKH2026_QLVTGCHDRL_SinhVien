/**
 * GetUserByIdUseCase
 * Use case for retrieving a user by ID
 * Follows Single Responsibility Principle (SRP)
 */

import type { IAdminUserRepository } from '../interfaces/IAdminUserRepository';
import { NotFoundError } from '../../../../core/errors/AppError';
import { mapUserToDetail, UserDetail } from '../utils/admin-users.mappers';

class GetUserByIdUseCase {
  private adminUserRepository: IAdminUserRepository;

  constructor(adminUserRepository: IAdminUserRepository) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute(userId: string): Promise<UserDetail> {
    const user = await this.adminUserRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError(`Không tìm thấy người dùng với id ${userId}`);
    }

    return mapUserToDetail(user);
  }
}

export default GetUserByIdUseCase;
module.exports = GetUserByIdUseCase;
