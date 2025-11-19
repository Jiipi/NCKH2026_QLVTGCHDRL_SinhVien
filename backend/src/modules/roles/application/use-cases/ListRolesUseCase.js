/**
 * ListRolesUseCase
 * Use case for listing roles with pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListRolesUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(options = {}) {
    const { page = 1, limit = 20, search } = options;

    const { items, total } = await this.roleRepository.findMany({ search }, { page, limit });

    // Convert quyen_han from object to array for all items
    items.forEach(item => {
      if (item.quyen_han && typeof item.quyen_han === 'object' && !Array.isArray(item.quyen_han)) {
        item.quyen_han = Object.values(item.quyen_han);
      }
    });

    return {
      items,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }
}

module.exports = ListRolesUseCase;

