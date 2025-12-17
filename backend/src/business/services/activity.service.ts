/**
 * Activity Service
 * Business Layer - Activity business logic
 * Wraps existing UseCases for TypeScript compatibility
 */

import type {
    Activity,
    PaginatedResponse,
    PaginationParams,
    AuthPayload,
    IActivityService
} from '../../core/types';

// Import existing UseCases with ES6 imports
import GetActivitiesUseCase from '../../modules/activities/business/services/GetActivitiesUseCase';
import CreateActivityUseCase from '../../modules/activities/business/services/CreateActivityUseCase';
import UpdateActivityUseCase from '../../modules/activities/business/services/UpdateActivityUseCase';
import DeleteActivityUseCase from '../../modules/activities/business/services/DeleteActivityUseCase';
import ApproveActivityUseCase from '../../modules/activities/business/services/ApproveActivityUseCase';
import RejectActivityUseCase from '../../modules/activities/business/services/RejectActivityUseCase';
import GetActivityByIdUseCase from '../../modules/activities/business/services/GetActivityByIdUseCase';

// Import repository instance (already instantiated in JS file)
const activityRepository = require('../../modules/activities/data/repositories/activities.repository');

/**
 * ActivityService - Wrapper around existing UseCases
 * Provides TypeScript interface for activity operations
 */
export class ActivityService implements IActivityService {
    private repository: unknown;
    private getActivitiesUseCase: InstanceType<typeof GetActivitiesUseCase>;
    private getActivityByIdUseCase: InstanceType<typeof GetActivityByIdUseCase>;
    private createActivityUseCase: InstanceType<typeof CreateActivityUseCase>;
    private updateActivityUseCase: InstanceType<typeof UpdateActivityUseCase>;
    private deleteActivityUseCase: InstanceType<typeof DeleteActivityUseCase>;
    private approveActivityUseCase: InstanceType<typeof ApproveActivityUseCase>;
    private rejectActivityUseCase: InstanceType<typeof RejectActivityUseCase>;

    constructor() {
        this.repository = activityRepository;
        this.getActivitiesUseCase = new GetActivitiesUseCase(this.repository);
        this.getActivityByIdUseCase = new GetActivityByIdUseCase(this.repository);
        this.createActivityUseCase = new CreateActivityUseCase(this.repository);
        this.updateActivityUseCase = new UpdateActivityUseCase(this.repository);
        this.deleteActivityUseCase = new DeleteActivityUseCase(this.repository);
        this.approveActivityUseCase = new ApproveActivityUseCase(this.repository);
        this.rejectActivityUseCase = new RejectActivityUseCase(this.repository);
    }

    async getActivities(
        params: PaginationParams,
        user?: AuthPayload
    ): Promise<PaginatedResponse<Activity>> {
        const dto = {
            page: params.page || 1,
            limit: params.limit || 10,
            sort: params.sort || 'ngay_cap_nhat',
            order: params.order || 'desc',
            ...params,
        };
        return this.getActivitiesUseCase.execute(dto, user);
    }

    async getActivityById(id: string): Promise<Activity | null> {
        return this.getActivityByIdUseCase.execute(id);
    }

    async createActivity(data: Partial<Activity>, userId: string): Promise<Activity> {
        const dto = { ...data, nguoi_tao_id: userId };
        return this.createActivityUseCase.execute(dto, { sub: userId });
    }

    async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
        return this.updateActivityUseCase.execute(id, data);
    }

    async deleteActivity(id: string): Promise<void> {
        return this.deleteActivityUseCase.execute(id);
    }

    async approveActivity(id: string, note?: string): Promise<Activity> {
        return this.approveActivityUseCase.execute(id, note);
    }

    async rejectActivity(id: string, reason: string): Promise<Activity> {
        return this.rejectActivityUseCase.execute(id, reason);
    }
}

// Singleton instance
export const activityService = new ActivityService();
export default activityService;
