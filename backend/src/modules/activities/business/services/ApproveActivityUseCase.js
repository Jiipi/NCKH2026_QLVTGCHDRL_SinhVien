const { NotFoundError, ValidationError } = require('../../../../core/errors/AppError');
const crypto = require('crypto');

/**
 * ApproveActivityUseCase
 * Use case for approving an activity
 * Follows Single Responsibility Principle (SRP)
 */
class ApproveActivityUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id) {
    const activity = await this.activityRepository.findById(id);

    if (!activity) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    if (activity.trang_thai === 'da_duyet') {
      throw new ValidationError('Hoạt động đã được duyệt');
    }

    // Generate QR token if not exists
    const updateData = {
      trang_thai: 'da_duyet'
    };

    if (!activity.qr) {
      updateData.qr = this.generateQRToken();
    }

    return this.activityRepository.update(id, updateData);
  }

  generateQRToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = ApproveActivityUseCase;

