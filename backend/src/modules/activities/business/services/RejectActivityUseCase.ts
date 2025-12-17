/**
 * RejectActivityUseCase
 * Use case for rejecting an activity
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import type { HoatDong, Prisma } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';

/**
 * Update data for rejecting activity
 */
interface RejectUpdateData {
  trang_thai: 'tu_choi';
  ly_do_tu_choi?: string;
}

/**
 * RejectActivityUseCase
 */
class RejectActivityUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id: string, reason?: string): Promise<HoatDong> {
    const activity = await this.activityRepository.findById(id);

    if (!activity) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    if (activity.trang_thai === 'tu_choi') {
      throw new ValidationError('Hoạt động đã bị từ chối');
    }

    const updateData: RejectUpdateData = {
      trang_thai: 'tu_choi'
    };

    // Note: Schema may not have ly_do_tu_choi field
    // If it exists, uncomment below:
    // if (reason) {
    //   updateData.ly_do_tu_choi = reason;
    // }

    return this.activityRepository.update(id, updateData as Prisma.HoatDongUpdateInput);
  }
}

export default RejectActivityUseCase;
