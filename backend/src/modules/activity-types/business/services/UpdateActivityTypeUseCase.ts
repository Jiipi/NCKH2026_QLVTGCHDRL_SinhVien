import type { LoaiHoatDong } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import type IActivityTypeRepository from '../interfaces/IActivityTypeRepository';
import type { UpdateActivityTypeData } from '../interfaces/IActivityTypeRepository';
import { logInfo } from '../../../../core/logger';

/**
 * UpdateActivityTypeUseCase
 * Use case for updating activity type
 * Follows Single Responsibility Principle (SRP)
 */
class UpdateActivityTypeUseCase {
  private activityTypeRepository: IActivityTypeRepository;

  constructor(activityTypeRepository: IActivityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute(id: string, data: UpdateActivityTypeData, adminId: string): Promise<LoaiHoatDong> {
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

export default UpdateActivityTypeUseCase;
module.exports = UpdateActivityTypeUseCase;
