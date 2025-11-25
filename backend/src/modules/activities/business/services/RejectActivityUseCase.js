const { NotFoundError, ValidationError } = require('../../../../core/errors/AppError');

/**
 * RejectActivityUseCase
 * Use case for rejecting an activity
 * Follows Single Responsibility Principle (SRP)
 */
class RejectActivityUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id, reason) {
    const activity = await this.activityRepository.findById(id);

    if (!activity) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    if (activity.trang_thai === 'tu_choi') {
      throw new ValidationError('Hoạt động đã bị từ chối');
    }

    const updateData = {
      trang_thai: 'tu_choi'
    };

    // Note: Schema may not have ly_do_tu_choi field
    // If it exists, uncomment below:
    // if (reason) {
    //   updateData.ly_do_tu_choi = reason;
    // }

    return this.activityRepository.update(id, updateData);
  }
}

module.exports = RejectActivityUseCase;

