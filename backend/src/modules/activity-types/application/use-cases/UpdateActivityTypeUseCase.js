const { NotFoundError, ValidationError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * UpdateActivityTypeUseCase
 * Use case for updating activity type
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateActivityTypeUseCase {
  constructor(activityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute(id, data, adminId) {
    // Check if exists
    const existing = await this.activityTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Loại hoạt động không tồn tại');
    }

    // Check for duplicate name if name is being changed
    if (data.ten_loai_hd && data.ten_loai_hd !== existing.ten_loai_hd) {
      const duplicate = await this.activityTypeRepository.findByName(data.ten_loai_hd);
      if (duplicate && duplicate.id !== String(id)) {
        throw new ValidationError('Tên loại hoạt động đã tồn tại');
      }
    }

    // Update activity type
    const updated = await this.activityTypeRepository.update(id, data);

    logInfo(`Admin ${adminId} updated activity type ID ${id}`);

    return updated;
  }
}

module.exports = UpdateActivityTypeUseCase;

