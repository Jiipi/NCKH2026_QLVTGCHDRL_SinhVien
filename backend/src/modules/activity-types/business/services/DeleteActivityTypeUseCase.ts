import { NotFoundError } from '../../../../core/errors/AppError';
import type IActivityTypeRepository from '../interfaces/IActivityTypeRepository';
const { logInfo } = require('../../../../core/logger');

/**
 * DeleteActivityTypeUseCase
 * Use case for deleting activity type
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteActivityTypeUseCase {
  private activityTypeRepository: IActivityTypeRepository;

  constructor(activityTypeRepository: IActivityTypeRepository) {
    this.activityTypeRepository = activityTypeRepository;
  }

  async execute(id: string, adminId: string): Promise<void> {
    // Check if exists
    const existing = await this.activityTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Loại hoạt động không tồn tại');
    }

    // Delete activity type (Prisma will throw error if foreign key constraints exist)
    await this.activityTypeRepository.delete(id);

    logInfo(`Admin ${adminId} deleted activity type ID ${id}: ${existing.ten_loai_hd}`);
  }
}

export default DeleteActivityTypeUseCase;
module.exports = DeleteActivityTypeUseCase;
