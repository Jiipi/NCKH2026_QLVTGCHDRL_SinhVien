import type { LoaiHoatDong } from '@prisma/client';
import { ValidationError } from '../../../../core/errors/AppError';
import CreateActivityTypeDto, { CreateActivityTypeInput } from '../dto/CreateActivityTypeDto';
import type IActivityTypeRepository from '../interfaces/IActivityTypeRepository';
import { logInfo } from '../../../../core/logger';

/**
 * CreateActivityTypeUseCase
 * Use case for creating activity type
 * Follows Single Responsibility Principle (SRP)
 */
class CreateActivityTypeUseCase {
  private activityTypeRepository: IActivityTypeRepository;

  constructor(activityTypeRepository: IActivityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute(data: unknown, adminId: string): Promise<LoaiHoatDong> {
    const validatedData: CreateActivityTypeInput = CreateActivityTypeDto.fromRequest(data);

    // Check for duplicate
    const existing = await this.activityTypeRepository.findByName(validatedData.ten_loai_hd);
    if (existing) {
      throw new ValidationError('Loại hoạt động đã tồn tại');
    }

    // Create activity type
    const activityType = await this.activityTypeRepository.create(validatedData);

    logInfo(`Admin ${adminId} created activity type: ${validatedData.ten_loai_hd}`);

    return activityType;
  }
}

export default CreateActivityTypeUseCase;
module.exports = CreateActivityTypeUseCase;
