/**
 * ListActivityTypesUseCase
 * Use case for listing activity types with pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListActivityTypesUseCase {
  constructor(activityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute({ page = 1, limit = 10, search }) {
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [items, total] = await Promise.all([
      this.activityTypeRepository.findAll({ skip, take, search }),
      this.activityTypeRepository.count(search),
    ]);

    return {
      items,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }
}

module.exports = ListActivityTypesUseCase;

