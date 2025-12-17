import type { LoaiHoatDong } from '@prisma/client';
import { NotFoundError } from '../../../../core/errors/AppError';
import type IActivityTypeRepository from '../interfaces/IActivityTypeRepository';

/**
 * GetActivityTypeByIdUseCase
 * Use case for getting activity type by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivityTypeByIdUseCase {
  private activityTypeRepository: IActivityTypeRepository;

  constructor(activityTypeRepository: IActivityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute(id: string): Promise<LoaiHoatDong> {
    const activityType = await this.activityTypeRepository.findById(id);
    
    if (!activityType) {
      throw new NotFoundError('Không tìm thấy loại hoạt động');
    }

    return activityType;
  }
}

export default GetActivityTypeByIdUseCase;
module.exports = GetActivityTypeByIdUseCase;
