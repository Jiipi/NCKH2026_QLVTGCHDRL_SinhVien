const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetClassActivitiesUseCase
 * Use case for getting activities for a class
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassActivitiesUseCase {
  constructor(classRepository) {
    this.classRepository = classRepository;
  }

  async execute(classId, user) {
    const classData = await this.classRepository.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    const activities = await this.classRepository.getActivities(classId);
    return activities;
  }
}

module.exports = GetClassActivitiesUseCase;

