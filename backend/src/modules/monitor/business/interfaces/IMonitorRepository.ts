import type { DangKyHoatDong, SinhVien, HoatDong, Lop, TrangThaiDangKy, LoaiHoatDong, NguoiDung, LoaiThongBao, ThongBao } from '@prisma/client';

/**
 * Type definitions for monitor module
 */
export interface ActivityFilter {
  hoc_ky?: number;
  nam_hoc?: string;
  nguoi_tao_id?: { in: string[] };
  ngay_bd?: { gte: Date };
  trang_thai?: { in: string[] };
}

export interface RegistrationFilters {
  status?: string | null;
  activityFilter?: ActivityFilter;
}

export interface SemesterWhere {
  hoc_ky?: number;
  nam_hoc?: string;
}

export interface NotificationData {
  tieu_de: string;
  noi_dung: string;
  loai_tb_id: string;
  nguoi_gui_id: string;
  nguoi_nhan_id: string;
  muc_do_uu_tien: string;
  phuong_thuc_gui: string;
}

export interface StudentWithRelations {
  id: string;
  mssv: string;
  nguoi_dung_id: string;
  lop_id: string;
  sdt?: string | null;
  nguoi_dung?: Partial<NguoiDung> | null;
  lop?: Partial<Lop> | null;
}

export interface RegistrationWithRelations extends DangKyHoatDong {
  sinh_vien?: StudentWithRelations | null;
  hoat_dong?: (Partial<HoatDong> & { loai_hd?: Partial<LoaiHoatDong> | null }) | null;
  nguoi_duyet?: Partial<NguoiDung> | null;
}

export interface ActivityWithRelations extends Partial<HoatDong> {
  loai_hd?: Partial<LoaiHoatDong> | null;
  _count?: {
    dang_ky_hd?: number;
  };
}

export interface ClassWithRelations extends Partial<Lop> {
  chu_nhiem?: string | null;
}

/**
 * IMonitorRepository
 * Interface for monitor data access
 * Follows Dependency Inversion Principle (DIP)
 */
abstract class IMonitorRepository {
  async findStudentsByClass(_classId: string): Promise<StudentWithRelations[]> {
    throw new Error('Method not implemented');
  }

  async findStudentRegistrations(_studentId: string, _activityFilter?: ActivityFilter): Promise<RegistrationWithRelations[]> {
    throw new Error('Method not implemented');
  }

  async findClassRegistrationsForPoints(_classId: string, _activityFilter?: ActivityFilter): Promise<RegistrationWithRelations[]> {
    throw new Error('Method not implemented');
  }

  async findClassRegistrations(_classId: string, _filters?: RegistrationFilters): Promise<RegistrationWithRelations[]> {
    throw new Error('Method not implemented');
  }

  async countPendingRegistrations(_classId: string): Promise<number> {
    throw new Error('Method not implemented');
  }

  async findRegistrationById(_registrationId: string): Promise<RegistrationWithRelations | null> {
    throw new Error('Method not implemented');
  }

  async updateRegistrationStatus(_registrationId: string, _status: TrangThaiDangKy | string, _additionalData?: Record<string, unknown>): Promise<DangKyHoatDong> {
    throw new Error('Method not implemented');
  }

  async createNotification(_data: NotificationData): Promise<ThongBao> {
    throw new Error('Method not implemented');
  }

  async findNotificationTypeByName(_name: string): Promise<LoaiThongBao | null> {
    throw new Error('Method not implemented');
  }

  async findFirstNotificationType(): Promise<LoaiThongBao | null> {
    throw new Error('Method not implemented');
  }

  async countStudentsByClass(_classId: string): Promise<number> {
    throw new Error('Method not implemented');
  }

  async countRegistrations(_classId: string, _filters?: RegistrationFilters): Promise<number> {
    throw new Error('Method not implemented');
  }

  async findRecentRegistrations(_classId: string, _activityFilter?: ActivityFilter, _limit?: number): Promise<RegistrationWithRelations[]> {
    throw new Error('Method not implemented');
  }

  async findUpcomingActivities(_classId: string, _activityFilter?: ActivityFilter, _limit?: number): Promise<ActivityWithRelations[]> {
    throw new Error('Method not implemented');
  }

  async findClassById(_classId: string): Promise<ClassWithRelations | null> {
    throw new Error('Method not implemented');
  }

  async findAllStudentsInClass(_classId: string): Promise<StudentWithRelations[]> {
    throw new Error('Method not implemented');
  }

  async findClassRegistrationsForCountApproved(_classId: string, _activityFilter?: ActivityFilter): Promise<{ hd_id: string }[]> {
    throw new Error('Method not implemented');
  }

  async countActivitiesForClassStrict(_classId: string, _semesterWhere?: SemesterWhere): Promise<number> {
    throw new Error('Method not implemented');
  }

  async findClassRegistrationsForReports(_classId: string, _activityFilter?: ActivityFilter): Promise<RegistrationWithRelations[]> {
    throw new Error('Method not implemented');
  }
}

export default IMonitorRepository;
module.exports = IMonitorRepository;
