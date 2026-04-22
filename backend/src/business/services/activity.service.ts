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
import type { HoatDong } from '@prisma/client';

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

/** Decimal-like value from Prisma */
interface DecimalLike { toNumber(): number; }

/** Raw activity data from Prisma query */
interface RawActivityData extends Record<string, unknown> {
  diem_rl?: number | DecimalLike | null;
  ngay_bd: Date | string;
  ngay_kt: Date | string;
  han_dk?: Date | string | null;
  ngay_tao?: Date | string | null;
  ngay_cap_nhat?: Date | string | null;
}

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
        // Repository implements IActivityRepository; cast through unknown for extended interfaces
        const repo = this.repository as unknown as ConstructorParameters<typeof GetActivitiesUseCase>[0];
        this.getActivitiesUseCase = new GetActivitiesUseCase(repo);
        this.getActivityByIdUseCase = new GetActivityByIdUseCase(this.repository);
        this.createActivityUseCase = new CreateActivityUseCase(this.repository);
        this.updateActivityUseCase = new UpdateActivityUseCase(this.repository);
        this.deleteActivityUseCase = new DeleteActivityUseCase(this.repository);
        this.approveActivityUseCase = new ApproveActivityUseCase(this.repository);
        this.rejectActivityUseCase = new RejectActivityUseCase(this.repository);
    }

    private mapToActivity(data: RawActivityData | HoatDong | null): Activity {
        if (!data) return null as unknown as Activity;
        const d = data as RawActivityData;
        return {
            ...d,
            // Handle Prisma Decimal
            diem_rl: d.diem_rl && typeof d.diem_rl === 'object' && 'toNumber' in d.diem_rl
                ? (d.diem_rl as DecimalLike).toNumber()
                : Number(d.diem_rl || 0),
            // Ensure dates are Dates
            ngay_bd: new Date(d.ngay_bd),
            ngay_kt: new Date(d.ngay_kt as string | Date),
            han_dk: d.han_dk ? new Date(d.han_dk) : undefined,
            ngay_tao: d.ngay_tao ? new Date(d.ngay_tao) : undefined,
            ngay_cap_nhat: d.ngay_cap_nhat ? new Date(d.ngay_cap_nhat) : undefined,
        } as unknown as Activity;
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
        const result = await this.getActivitiesUseCase.execute(
            dto as unknown as Parameters<GetActivitiesUseCase['execute']>[0],
            user as unknown as Parameters<GetActivitiesUseCase['execute']>[1]
        );

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
        const result = await this.getActivityByIdUseCase.execute(
            id,
            {} as Parameters<GetActivityByIdUseCase['execute']>[1],
            user as unknown as Parameters<GetActivityByIdUseCase['execute']>[2]
        );
        return this.mapToActivity(result as unknown as RawActivityData);
    }

    async createActivity(data: Partial<Activity>, user: AuthPayload): Promise<Activity> {
        const dto = { ...data, toDomain: () => data };
        const result = await this.createActivityUseCase.execute(
            dto as unknown as Parameters<CreateActivityUseCase['execute']>[0],
            user as unknown as Parameters<CreateActivityUseCase['execute']>[1]
        );
        return this.mapToActivity(result as unknown as RawActivityData);
    }

    async updateActivity(id: string, data: Partial<Activity>, user: AuthPayload): Promise<Activity> {
        const result = await this.updateActivityUseCase.execute(
            id,
            data as unknown as Parameters<UpdateActivityUseCase['execute']>[1],
            user as unknown as Parameters<UpdateActivityUseCase['execute']>[2]
        );
        return this.mapToActivity(result as unknown as RawActivityData);
    }

    async deleteActivity(id: string, user: AuthPayload): Promise<void> {
        await this.deleteActivityUseCase.execute(
            id,
            user as unknown as Parameters<DeleteActivityUseCase['execute']>[1]
        );
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
