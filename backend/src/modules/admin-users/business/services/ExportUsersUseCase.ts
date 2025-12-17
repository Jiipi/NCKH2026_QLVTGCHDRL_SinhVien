/**
 * ExportUsersUseCase
 * Use case for exporting users to CSV
 * Follows Single Responsibility Principle (SRP)
 */

import type { IAdminUserRepository } from '../interfaces/IAdminUserRepository';
import GetUsersUseCase from './GetUsersUseCase';
import { mapUsersToCsv } from '../utils/admin-users.mappers';
import type GetUsersDto from '../dto/GetUsersDto';

class ExportUsersUseCase {
  private adminUserRepository: IAdminUserRepository;
  private getUsersUseCase: GetUsersUseCase;

  constructor(adminUserRepository: IAdminUserRepository) {
    this.adminUserRepository = adminUserRepository;
    this.getUsersUseCase = new GetUsersUseCase(adminUserRepository);
  }

  async execute(filters: GetUsersDto): Promise<string> {
    const whereCondition = await this.getUsersUseCase.buildFilterConditions(filters);
    const users = await this.adminUserRepository.findUsers(whereCondition, {
      orderBy: { ngay_tao: 'desc' }
    });

    return mapUsersToCsv(users);
  }
}

export default ExportUsersUseCase;
module.exports = ExportUsersUseCase;
