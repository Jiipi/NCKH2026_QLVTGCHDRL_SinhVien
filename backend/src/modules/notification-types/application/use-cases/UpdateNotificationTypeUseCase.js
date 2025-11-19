const { NotFoundError, ValidationError } = require('../../../../core/errors/AppError');
const CreateNotificationTypeDto = require('../dto/CreateNotificationTypeDto');

/**
 * UpdateNotificationTypeUseCase
 * Use case for updating notification type
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateNotificationTypeUseCase {
  constructor(notificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(id, data) {
    const { ten_loai_tb, mo_ta } = CreateNotificationTypeDto.fromRequest(data);

    // Check if exists
    const existing = await this.notificationTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy loại thông báo');
    }

    // Check for duplicate name (excluding current record)
    const duplicate = await this.notificationTypeRepository.findByName(ten_loai_tb, id);

    if (duplicate) {
      throw new ValidationError('Tên loại thông báo đã tồn tại');
    }

    const updated = await this.notificationTypeRepository.update(id, { ten_loai_tb, mo_ta });
    return updated;
  }
}

module.exports = UpdateNotificationTypeUseCase;

