const GetUsersUseCase = require('./GetUsersUseCase');
const { mapUsersToCsv } = require('../utils/admin-users.mappers');

/**
 * ExportUsersUseCase
 * Use case for exporting users to CSV
 * Follows Single Responsibility Principle (SRP)
 */
class ExportUsersUseCase {
  constructor(adminUserRepository) {
    this.adminUserRepository = adminUserRepository;
    this.getUsersUseCase = new GetUsersUseCase(adminUserRepository);
  }

  async execute(filters) {
    const whereCondition = await this.getUsersUseCase.buildFilterConditions(filters);
    const users = await this.adminUserRepository.findUsers(whereCondition, {
      orderBy: { ngay_tao: 'desc' }
    });

    return mapUsersToCsv(users);
  }
}

module.exports = ExportUsersUseCase;

