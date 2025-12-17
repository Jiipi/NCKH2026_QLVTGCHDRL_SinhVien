import type { LoaiThongBao } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import CreateNotificationTypeDto, { CreateNotificationTypeInput } from '../dto/CreateNotificationTypeDto';
import type INotificationTypeRepository from '../interfaces/INotificationTypeRepository';

/**
 * UpdateNotificationTypeUseCase
 * Use case for updating notification type
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateNotificationTypeUseCase {
  private notificationTypeRepository: INotificationTypeRepository;

  constructor(notificationTypeRepository: INotificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(id: string, data: unknown): Promise<LoaiThongBao> {
    const { ten_loai_tb, mo_ta }: CreateNotificationTypeInput = CreateNotificationTypeDto.fromRequest(data);

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

export default UpdateNotificationTypeUseCase;
module.exports = UpdateNotificationTypeUseCase;
