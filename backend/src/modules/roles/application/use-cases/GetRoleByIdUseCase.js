const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetRoleByIdUseCase
 * Use case for getting role by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetRoleByIdUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id) {
    const item = await this.roleRepository.findById(id);

    if (!item) {
      throw new NotFoundError('Không tìm thấy vai trò');
    }

    // Convert quyen_han from object to array if needed
    if (item.quyen_han && typeof item.quyen_han === 'object' && !Array.isArray(item.quyen_han)) {
      item.quyen_han = Object.values(item.quyen_han);
    }

    return item;
  }
}

module.exports = GetRoleByIdUseCase;

