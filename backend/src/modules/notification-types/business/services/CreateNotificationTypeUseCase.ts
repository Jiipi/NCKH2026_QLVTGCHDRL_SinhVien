import type { LoaiThongBao } from '@prisma/client';
import { ValidationError } from '../../../../core/errors/AppError';
import CreateNotificationTypeDto, { CreateNotificationTypeInput } from '../dto/CreateNotificationTypeDto';
import type INotificationTypeRepository from '../interfaces/INotificationTypeRepository';

/**
 * CreateNotificationTypeUseCase
 * Use case for creating notification type
 * Follows Single Responsibility Principle (SRP)
 */
class CreateNotificationTypeUseCase {
  private notificationTypeRepository: INotificationTypeRepository;

  constructor(notificationTypeRepository: INotificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute(data: unknown): Promise<LoaiThongBao> {
    const { ten_loai_tb, mo_ta }: CreateNotificationTypeInput = CreateNotificationTypeDto.fromRequest(data);

    // Check for duplicates
    const exists = await this.notificationTypeRepository.findByName(ten_loai_tb);
    
    if (exists) {
      throw new ValidationError('Loại thông báo đã tồn tại');
    }

    const item = await this.notificationTypeRepository.create({ ten_loai_tb, mo_ta });
    return item;
  }
}

export default CreateNotificationTypeUseCase;
module.exports = CreateNotificationTypeUseCase;
