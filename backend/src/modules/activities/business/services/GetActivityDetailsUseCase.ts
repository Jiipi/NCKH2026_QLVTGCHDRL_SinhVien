/**
 * GetActivityDetailsUseCase
 * Use case for getting activity details with registrations
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import activitiesRepo from '../../data/repositories/activities.repository';
import { normalizeRole } from '../../../../core/utils/roleHelper';
import type { HoatDong } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';

/**
 * User context for authentication
 */
interface AuthUser {
  sub?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Activity with details (includes relations)
 */
interface ActivityWithDetails extends HoatDong {
  [key: string]: unknown;
}

/**
 * Enriched activity with user-specific fields
 */
interface EnrichedActivity extends ActivityWithDetails {
  is_creator: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

/**
 * GetActivityDetailsUseCase
 */
class GetActivityDetailsUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id: string, user?: AuthUser): Promise<EnrichedActivity> {
    const activity = await (activitiesRepo as any).findByIdWithDetails(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }
    
    // Enrich activity with user-specific fields
    return this.enrichActivity(activity as ActivityWithDetails, user);
  }

  enrichActivity(activity: ActivityWithDetails, user?: AuthUser): EnrichedActivity {
    const userRole = user ? normalizeRole(user.role) : null;
    const userId = user?.sub || null;
    
    const enriched: EnrichedActivity = {
      ...activity,
      is_creator: userId ? (activity.nguoi_tao_id === userId) : false,
      can_edit: userId ? (activity.nguoi_tao_id === userId || ['ADMIN', 'GIANG_VIEN'].includes(userRole || '')) : false,
      can_delete: userRole ? ['ADMIN', 'GIANG_VIEN'].includes(userRole) : false
    };
    
    return enriched;
  }
}

export default GetActivityDetailsUseCase;
