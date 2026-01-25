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

// Import existing UseCases
import GetActivitiesUseCase from '../../modules/activities/business/services/GetActivitiesUseCase';
import CreateActivityUseCase from '../../modules/activities/business/services/CreateActivityUseCase';
import UpdateActivityUseCase from '../../modules/activities/business/services/UpdateActivityUseCase';
import DeleteActivityUseCase from '../../modules/activities/business/services/DeleteActivityUseCase';
import ApproveActivityUseCase from '../../modules/activities/business/services/ApproveActivityUseCase';
import RejectActivityUseCase from '../../modules/activities/business/services/RejectActivityUseCase';
import GetActivityByIdUseCase from '../../modules/activities/business/services/GetActivityByIdUseCase';

// Import repository
import ActivitiesRepository, { activitiesRepository } from '../../modules/activities/data/repositories/activities.repository';

/**
 * ActivityService - Wrapper around existing UseCases
 * Provides TypeScript interface for activity operations
 */
export class ActivityService implements IActivityService {
    private repository: ActivitiesRepository;
    private getActivitiesUseCase: GetActivitiesUseCase;
    private getActivityByIdUseCase: GetActivityByIdUseCase;
    private createActivityUseCase: CreateActivityUseCase;
    private updateActivityUseCase: UpdateActivityUseCase;
    private deleteActivityUseCase: DeleteActivityUseCase;
    private approveActivityUseCase: ApproveActivityUseCase;
    private rejectActivityUseCase: RejectActivityUseCase;

    constructor() {
        this.repository = activitiesRepository;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.getActivitiesUseCase = new GetActivitiesUseCase(this.repository as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.getActivityByIdUseCase = new GetActivityByIdUseCase(this.repository as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.createActivityUseCase = new CreateActivityUseCase(this.repository as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.updateActivityUseCase = new UpdateActivityUseCase(this.repository as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.deleteActivityUseCase = new DeleteActivityUseCase(this.repository as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.approveActivityUseCase = new ApproveActivityUseCase(this.repository as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.rejectActivityUseCase = new RejectActivityUseCase(this.repository as any);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapToActivity(data: any): Activity {
        if (!data) return null as any;
        return {
            ...data,
            // Handle Prisma Decimal
            diem_rl: data.diem_rl && typeof data.diem_rl === 'object' && 'toNumber' in data.diem_rl
                ? data.diem_rl.toNumber()
                : Number(data.diem_rl || 0),
            // Ensure dates are Dates
            ngay_bd: new Date(data.ngay_bd),
            ngay_kt: new Date(data.ngay_kt),
            han_dk: data.han_dk ? new Date(data.han_dk) : undefined,
            ngay_tao: data.ngay_tao ? new Date(data.ngay_tao) : undefined,
            ngay_cap_nhat: data.ngay_cap_nhat ? new Date(data.ngay_cap_nhat) : undefined,
        } as Activity;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await this.getActivitiesUseCase.execute(dto as any, user as any);

        return {
            items: (result.items || []).map(item => this.mapToActivity(item)),
            pagination: {
                page: result.page || 1,
                limit: result.limit || 10,
                total: result.total || 0,
                totalPages: result.limit ? Math.ceil((result.total || 0) / result.limit) : 1
            }
        };
    }

    async getActivityById(id: string, user?: AuthPayload): Promise<Activity | null> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await this.getActivityByIdUseCase.execute(id, {} as any, user as any);
        return this.mapToActivity(result);
    }

    async createActivity(data: Partial<Activity>, user: AuthPayload): Promise<Activity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dto = { ...data, toDomain: () => data };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await this.createActivityUseCase.execute(dto as any, user as any);
        return this.mapToActivity(result);
    }

    async updateActivity(id: string, data: Partial<Activity>, user: AuthPayload): Promise<Activity> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await this.updateActivityUseCase.execute(id, data as any, user as any);
        return this.mapToActivity(result);
    }

    async deleteActivity(id: string, user: AuthPayload): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.deleteActivityUseCase.execute(id, user as any);
    }

    async approveActivity(id: string, note?: string): Promise<Activity> {
        // Note is unused in UseCase? Or passed differently?
        // ApproveActivityUseCase.execute(id)
        const result = await this.approveActivityUseCase.execute(id);
        return this.mapToActivity(result);
    }

    async rejectActivity(id: string, reason: string): Promise<Activity> {
        const result = await this.rejectActivityUseCase.execute(id, reason);
        return this.mapToActivity(result);
    }
}

// Singleton instance
export const activityService = new ActivityService();
export default activityService;
