/**
 * GetTeacherDashboardUseCase
 * Use case for getting teacher dashboard data
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';
import { ListRegistrationsDto } from '../../../registrations/business/dto/ListRegistrationsDto';

/**
 * User object from JWT token
 */
interface AuthUser {
  sub: string;
  id?: string;
  role: string;
}

/**
 * Activity with loai_hd for points calculation
 */
interface ActivityWithType {
  diem_rl?: number | { toNumber(): number } | string | null;
  loai_hd?: {
    diem_mac_dinh?: number | { toNumber(): number } | string | null;
  };
}

/**
 * Registration with activity
 */
interface RegistrationWithActivity {
  hoat_dong?: ActivityWithType;
}

/**
 * Student with registrations
 */
interface StudentData {
  id?: string;
  nguoi_dung_id?: string;
  nguoi_dung?: {
    id: string;
    ho_ten: string | null;
    anh_dai_dien: string | null;
  };
  mssv: string;
  name?: string | null;
  email?: string | null;
  className?: string | null;
  lop?: {
    ten_lop: string;
  };
  dang_ky_hd?: RegistrationWithActivity[];
}

/**
 * Dashboard class info
 */
interface DashboardClass {
  id: string;
  ten_lop: string;
}

/**
 * Pending registration from list use case
 */
interface PendingRegistration {
  id: string;
  hoat_dong?: {
    id: string;
    ten_hd: string;
    ngay_bd: Date;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Interface for ListRegistrationsUseCase
 */
interface IListRegistrationsUseCase {
  execute(dto: unknown, user: AuthUser): Promise<{ data?: PendingRegistration[] }>;
}

/**
 * Interface for GetPendingActivitiesUseCase (activities with trang_thai = 'cho_duyet')
 */
interface IGetPendingActivitiesUseCase {
  execute(user: AuthUser, pagination?: { semester?: string; page?: number; limit?: number }): Promise<{ items?: ActivityData[]; total?: number }>;
}

/**
 * Activity data from pending activities use case
 */
interface ActivityData {
  id: string;
  ten_hd: string;
  trang_thai: string;
  [key: string]: unknown;
}

/**
 * GetTeacherDashboardUseCase
 * Use case for getting teacher dashboard data
 */
class GetTeacherDashboardUseCase {
  private teacherRepository: ITeacherRepository;
  private listRegistrationsUseCase: IListRegistrationsUseCase;
  private getPendingActivitiesUseCase: IGetPendingActivitiesUseCase | null;

  constructor(
    teacherRepository: ITeacherRepository, 
    listRegistrationsUseCase: IListRegistrationsUseCase,
    getPendingActivitiesUseCase?: IGetPendingActivitiesUseCase
  ) {
    this.teacherRepository = teacherRepository;
    this.listRegistrationsUseCase = listRegistrationsUseCase;
    this.getPendingActivitiesUseCase = getPendingActivitiesUseCase || null;
  }

  async execute(user: AuthUser, semester: string | null = null, classId: string | null = null) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = user.sub || user.id;
    if (!userId) {
      throw new ForbiddenError('Không xác định được người dùng');
    }

    // Create DTO for pending registrations
    // Dashboard cần hiển thị nhiều hơn 5 đăng ký để người dùng có cái nhìn tổng quan tốt hơn
    const registrationsDto = new ListRegistrationsDto({
      status: 'cho_duyet',
      page: 1,
      limit: null,
      includeApprover: false,
      semester
    });

    const [stats, classes, pendingRegistrationsResult, students, pendingActivitiesResult] = await Promise.all([
      this.teacherRepository.getDashboardStats(userId, semester, classId),
      this.teacherRepository.getTeacherClasses(userId),
      this.listRegistrationsUseCase.execute(registrationsDto, user),
      this.teacherRepository.getTeacherStudents(userId, { classId: classId || undefined, semester: semester || undefined }),
      // Get actual pending activities (trang_thai = 'cho_duyet') if use case is available
      this.getPendingActivitiesUseCase 
        ? this.getPendingActivitiesUseCase.execute(user, { semester: semester || undefined, limit: 10 })
        : Promise.resolve({ items: [] })
    ]);

    const pendingRegistrations = pendingRegistrationsResult?.data || [];
    
    // Use actual pending activities from GetPendingActivitiesUseCase
    const pendingActivities = (pendingActivitiesResult as { items?: ActivityData[] })?.items || [];

    return {
      summary: stats,
      pendingActivities,
      pendingRegistrations,
      classes: (classes as DashboardClass[]).map(c => ({
        id: c.id,
        ten_lop: c.ten_lop
      })),
      students: (students as unknown as StudentData[]).map(s => {
        /**
         * Tính điểm cho hoạt động
         * Ưu tiên diem_rl của hoạt động, nếu null/undefined hoặc = 0 thì dùng diem_mac_dinh của loại hoạt động
         */
        const calculateActivityPoints = (activity: ActivityWithType | undefined): number => {
          if (!activity) return 0;
          
          // Xử lý diem_rl (có thể là Decimal, Number, hoặc String)
          let diemRl: number | null = null;
          if (activity.diem_rl != null && activity.diem_rl !== undefined) {
            diemRl = typeof activity.diem_rl === 'object' && 'toNumber' in activity.diem_rl
              ? activity.diem_rl.toNumber() 
              : parseFloat(String(activity.diem_rl));
            
            // Nếu parseFloat trả về NaN, coi như null
            if (isNaN(diemRl)) {
              diemRl = null;
            }
          }
          
          // Nếu hoạt động có điểm được set và > 0, dùng điểm đó
          if (diemRl != null && diemRl > 0) {
            return diemRl;
          }
          
          // Nếu không có điểm hoặc = 0, dùng điểm mặc định của loại hoạt động
          if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
            const diemMacDinh = typeof activity.loai_hd.diem_mac_dinh === 'object' && 'toNumber' in activity.loai_hd.diem_mac_dinh
              ? activity.loai_hd.diem_mac_dinh.toNumber()
              : parseFloat(String(activity.loai_hd.diem_mac_dinh));
            
            // Nếu parseFloat trả về NaN, trả về 0
            return isNaN(diemMacDinh) ? 0 : diemMacDinh;
          }
          
          return 0;
        };

        const totalPoints = s.dang_ky_hd?.reduce((sum: number, dk: RegistrationWithActivity) => {
          const points = calculateActivityPoints(dk.hoat_dong);
          return sum + points;
        }, 0) || 0;

        // Repository returns mapped fields: name, email, className instead of nested objects
        return {
          id: s.id || s.nguoi_dung_id || s.nguoi_dung?.id,
          ho_ten: s.name || s.nguoi_dung?.ho_ten,
          avatar: s.nguoi_dung?.anh_dai_dien,
          mssv: s.mssv,
          lop: s.className || s.lop?.ten_lop,
          diem_rl: totalPoints
        };
      })
    };
  }
}

export default GetTeacherDashboardUseCase;
module.exports = GetTeacherDashboardUseCase;
