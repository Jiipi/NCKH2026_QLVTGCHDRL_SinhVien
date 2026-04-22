/**
 * GetActivityRegistrationStatsUseCase
 * Use case for retrieving registration stats of an activity
 */

import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import { canManageActivity } from '../helpers/registrationAccess';
import type { IRegistrationRepository, ActivityStats } from '../interfaces/IRegistrationRepository';
import type { AuthUser } from '../helpers/registrationAccess';

/**
 * Activity query result
 */
interface ActivityQueryResult {
  id: string;
  ten_hd: string;
  nguoi_tao_id: string;
  trang_thai: string;
}

/**
 * GetActivityRegistrationStatsUseCase
 */
export class GetActivityRegistrationStatsUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(activityId: string, user: AuthUser): Promise<ActivityStats> {
    const activityEntity = await this.registrationRepository.findActivityForRegistrationValidation(activityId);
    const activity = activityEntity
      ? ({
          id: activityEntity.id,
          ten_hd: activityEntity.ten_hd,
          nguoi_tao_id: '',
          trang_thai: activityEntity.trang_thai,
        } as ActivityQueryResult)
      : null;

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    const canView = await canManageActivity(activity, user);
    if (!canView && user.role !== 'SINH_VIEN') {
      throw new ForbiddenError('Không có quyền xem thống kê');
    }

    const stats = await this.registrationRepository.getActivityStats(activityId);
    return stats;
  }
}

export default GetActivityRegistrationStatsUseCase;
