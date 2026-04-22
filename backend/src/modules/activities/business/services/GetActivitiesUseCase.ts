import type { HoatDong, Prisma, TrangThaiHoatDong, HocKy, DangKyHoatDong } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';
import type { FindManyOptions } from '../interfaces/IActivityRepository';
import GetActivitiesDto from '../dto/GetActivitiesDto';
import { parseSemesterString } from '../../../../core/utils/semester';

/**
 * User type for authorization
 */
interface User {
  sub: string;
  role: string;
  [key: string]: unknown;
}

/**
 * Dto type with scope
 */
interface GetActivitiesDtoType {
  search?: string;
  type?: string;
  status?: string;
  from?: string | Date;
  to?: string | Date;
  semester?: string;
  classId?: string;
  limit?: number | string;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  scope?: {
    activityFilter?: Prisma.HoatDongWhereInput;
    [key: string]: unknown;
  };
}

/**
 * Query options type
 */
interface QueryOptions {
  page: number;
  limit?: number;
  sort: string;
  order: 'asc' | 'desc';
}

/**
 * Registration info for enriched activities
 */
interface RegistrationInfo {
  registration_status: string;
  trang_thai_dk: string;
  is_registered: boolean;
  ngay_dang_ky: Date;
}

/**
 * Enriched activity type
 */
interface EnrichedActivity extends HoatDong {
  is_registered?: boolean;
  registration_status?: string | null;
  trang_thai_dk?: string | null;
  ngay_dang_ky?: Date | null;
  is_class_activity?: boolean;
  has_class_registrations?: boolean;
  class_relation?: string;
  registrationCount?: number;
}

/**
 * Result type from repository findMany
 */
interface PaginatedResult<T> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Extended repository interface with additional methods
 */
interface ExtendedActivityRepository extends IActivityRepository {
  findStudentByUserId(userId: string): Promise<{ id: string; lop_id?: string | null; nguoi_dung_id?: string } | null>;
  findRegistrationsByStudent(studentId: string, activityIds: string[]): Promise<Array<{
    hd_id: string;
    trang_thai_dk: string;
    ngay_dang_ky: Date;
  }>>;
  findStudentsByClass(classId: string): Promise<Array<{ nguoi_dung_id?: string }>>;
  findClassById(classId: string): Promise<{ chu_nhiem?: string } | null>;
  countRegistrationsByClass(activityIds: string[], classId: string): Promise<Record<string, number>>;
}

/**
 * GetActivitiesUseCase
 * Use case for retrieving paginated list of activities with filters
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivitiesUseCase {
  private activityRepository: ExtendedActivityRepository;

  constructor(activityRepository: ExtendedActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(dto: GetActivitiesDtoType, user?: User): Promise<PaginatedResult<EnrichedActivity>> {
    const where = await this.buildWhereClause(dto, user);
    const options = this.buildQueryOptions(dto);

    const result = await this.activityRepository.findMany(where, options as unknown as FindManyOptions) as unknown as PaginatedResult<HoatDong>;

    // Enrich activities with registration status for students
    if (user && (user.role === 'SINH_VIEN' || user.role === 'LOP_TRUONG') && result.items && result.items.length > 0) {
      result.items = await this.enrichActivitiesWithRegistrations(result.items, user.sub, user.role);
    }

    return result as PaginatedResult<EnrichedActivity>;
  }

  async buildWhereClause(dto: GetActivitiesDtoType, user?: User): Promise<Prisma.HoatDongWhereInput> {
    const where: Prisma.HoatDongWhereInput = {};

    // Apply scope filter from middleware
    if (dto.scope && dto.scope.activityFilter) {
      Object.assign(where, dto.scope.activityFilter);
    }

    // Text search
    if (dto.search) {
      where.ten_hd = { contains: String(dto.search), mode: 'insensitive' };
    }

    // Filter by activity type
    if (dto.type) {
      where.loai_hd_id = String(dto.type);
    }

    // Filter by status - cho phép filter thêm (và override scope nếu cần)
    if (dto.status) {
      where.trang_thai = String(dto.status) as TrangThaiHoatDong;
    }

    // Filter by time-based status (chỉ dùng cho các status đặc biệt open/soon/closed)
    const now = new Date();
    if (dto.status === 'open') {
      where.trang_thai = 'da_duyet' as TrangThaiHoatDong;
      where.han_dk = { gte: now };
      where.ngay_bd = { gt: now };
    } else if (dto.status === 'soon') {
      where.trang_thai = 'da_duyet' as TrangThaiHoatDong;
      where.ngay_bd = { lte: now };
      where.ngay_kt = { gte: now };
    } else if (dto.status === 'closed') {
      where.ngay_kt = { lt: now };
    }

    // Date range filter
    if (dto.from || dto.to) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (dto.from) {
        const fromDate = new Date(dto.from);
        fromDate.setHours(0, 0, 0, 0);
        dateFilter.gte = fromDate;
      }
      if (dto.to) {
        const toDate = new Date(dto.to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }
      if (Object.keys(dateFilter).length > 0) {
        where.ngay_bd = dateFilter;
      }
    }

    // Semester filter
    if (dto.semester) {
      const parsed = parseSemesterString(dto.semester);
      if (parsed && parsed.year) {
        where.hoc_ky = parsed.semester as HocKy;
        // Data đã được chuẩn hóa sang năm đơn, dùng exact match
        where.nam_hoc = parsed.year;
      }
    }

    /**
     * Admin - filter theo lớp (tab "Theo lớp" trên màn admin activities)
     * ---------------------------------------------------------------
     * - Frontend gửi lop_id / classId khi scopeTab === 'class'.
     * - Định nghĩa mới: hoạt động thuộc lớp = hoat_dong.lop_id = classId,
     *   không quan tâm người tạo hay đăng ký.
     * - Luôn filter theo lop_id, cộng thêm hoc_ky/nam_hoc nếu có.
     * - Admin có thể thấy tất cả các trạng thái khi filter theo lớp.
     */
    if (dto.classId && user && user.role === 'ADMIN') {
      // Lọc theo lớp trực tiếp trên bảng HoatDong
      where.lop_id = String(dto.classId);
      // Don't auto-add status filter - let admin see all statuses
    }

    return where;
  }

  buildQueryOptions(dto: GetActivitiesDtoType): QueryOptions {
    // Handle 'all' limit - return undefined to fetch all records
    let effectiveLimit: number | undefined;
    if (dto.limit === 'all' || dto.limit === undefined) {
      effectiveLimit = undefined; // No limit - fetch all
    } else {
      const parsed = parseInt(String(dto.limit));
      effectiveLimit = isNaN(parsed) ? 10 : parsed;
    }

    const effectivePage = effectiveLimit === undefined ? 1 : (dto.page || 1);

    return {
      page: effectivePage,
      limit: effectiveLimit,
      sort: dto.sort || 'ngay_cap_nhat',
      order: dto.order || 'desc'
    };
  }

  async enrichActivitiesWithRegistrations(
    activities: HoatDong[],
    userId: string,
    userRole: string
  ): Promise<EnrichedActivity[]> {
    try {
      const student = await this.activityRepository.findStudentByUserId(userId);

      if (!student) {
        return activities as EnrichedActivity[];
      }

      const activityIds = activities.map(a => a.id).filter(Boolean);
      if (activityIds.length === 0) return activities as EnrichedActivity[];

      const registrations = await this.activityRepository.findRegistrationsByStudent(student.id, activityIds);

      const registrationMap = new Map<string, RegistrationInfo>();
      registrations.forEach(reg => {
        registrationMap.set(reg.hd_id, {
          registration_status: reg.trang_thai_dk,
          trang_thai_dk: reg.trang_thai_dk,
          is_registered: true,
          ngay_dang_ky: reg.ngay_dang_ky
        });
      });

      // For LOP_TRUONG: calculate class-related metrics
      let classCreators: string[] = [];
      let classRegistrationCounts: Record<string, number> = {};

      if (userRole === 'LOP_TRUONG' && student.lop_id) {
        const lopId = student.lop_id;

        const allClassStudents = await this.activityRepository.findStudentsByClass(lopId);
        classCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean) as string[];

        const lop = await this.activityRepository.findClassById(lopId);
        if (lop?.chu_nhiem) {
          classCreators.push(lop.chu_nhiem);
        }

        classRegistrationCounts = await this.activityRepository.countRegistrationsByClass(activityIds, lopId);
      }

      return activities.map(activity => {
        const regInfo = registrationMap.get(activity.id);

        let hasClassRegistrations = false;
        let classRelation = 'none';
        let registrationCount = 0;

        if (userRole === 'LOP_TRUONG') {
          const createdByClassOrHomeroom = classCreators.includes(activity.nguoi_tao_id);
          registrationCount = classRegistrationCounts[activity.id] || 0;
          hasClassRegistrations = registrationCount > 0;
          classRelation = createdByClassOrHomeroom ? 'owned' : (hasClassRegistrations ? 'participated' : 'none');
        }

        return {
          ...activity,
          is_registered: regInfo?.is_registered || false,
          registration_status: regInfo?.registration_status || null,
          trang_thai_dk: regInfo?.trang_thai_dk || null,
          ngay_dang_ky: regInfo?.ngay_dang_ky || null,
          is_class_activity: true,
          ...(userRole === 'LOP_TRUONG' ? {
            has_class_registrations: hasClassRegistrations,
            class_relation: classRelation,
            registrationCount: registrationCount
          } : {})
        };
      });
    } catch (error) {
      console.error('Error enriching activities with registrations:', error);
      return activities as EnrichedActivity[];
    }
  }
}

export default GetActivitiesUseCase;
