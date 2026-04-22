/**
 * ITeacherRepository
 * Interface for teacher data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { Lop, SinhVien, HoatDong, DangKyHoatDong, HocKy } from '@prisma/client';
import type {
  TeacherDashboardStats,
  ClassStats,
  TeacherClass,
  TeacherClassIncludeOptions,
  TeacherStudentFilters,
  TeacherStudent,
  PendingActivity,
  ClassRegistrationFilters,
  ClassRegistration
} from '../../teachers.types';

/**
 * Interface for teacher repository operations
 */
export interface ITeacherRepository {
  // Dashboard
  getDashboardStats(teacherId: string, semester?: string | null, classId?: string | null): Promise<TeacherDashboardStats>;
  getClassStats(className: string, semesterId?: string | null): Promise<ClassStats>;

  // Classes
  getTeacherClasses(teacherId: string, include?: TeacherClassIncludeOptions): Promise<TeacherClass[]>;
  getTeacherClassNames(teacherId: string): Promise<string[]>;
  hasAccessToClass(teacherId: string, className: string): Promise<boolean>;
  assignClassMonitor(teacherId: string, classId: string, studentId: string): Promise<{ classId: string; monitorStudentId: string }>;

  // Students
  getTeacherStudents(teacherId: string, filters?: TeacherStudentFilters): Promise<TeacherStudent[]>;
  exportStudents(teacherId: string): Promise<TeacherStudent[]>;
  createStudent(teacherId: string, payload: CreateStudentPayload): Promise<CreateStudentResult>;
  updateStudent(teacherId: string, studentId: string, payload: UpdateStudentPayload): Promise<CreateStudentResult>;
  deleteStudent(teacherId: string, studentId: string): Promise<boolean>;

  // Activities
  getPendingActivitiesList(teacherId: string, semester?: string | null, limit?: number, classId?: string | null): Promise<PendingActivity[]>;
  countActivitiesForTeacherClassesStrict(teacherId: string, semesterId?: string | null): Promise<number>;

  // Registrations
  getClassRegistrations(classIds: string[], filters?: ClassRegistrationFilters): Promise<ClassRegistration[]>;
  getTeacherClassRegistrationsForChartsAll(teacherId: string, semesterId?: string | null): Promise<RegistrationForCharts[]>;
  getTeacherClassRegistrationsForReports(teacherId: string, semesterId?: string | null): Promise<RegistrationForReports[]>;
}

/**
 * Payload for creating a student
 */
export interface CreateStudentPayload {
  ho_ten: string;
  email: string;
  mssv: string;
  ngay_sinh?: string | Date;
  gt?: string;
  lop_id: string;
  dia_chi?: string | null;
  sdt?: string | null;
  ten_dn: string;
  mat_khau: string;
}

/**
 * Payload for updating a student
 */
export interface UpdateStudentPayload {
  ho_ten?: string;
  email?: string;
  mssv?: string;
  ngay_sinh?: string | Date;
  gt?: string;
  lop_id?: string;
  dia_chi?: string | null;
  sdt?: string | null;
  ten_dn?: string;
  mat_khau?: string;
}

/**
 * Result from creating a student
 */
export interface CreateStudentResult {
  id: string;
  nguoi_dung: {
    id: string;
    ten_dn: string;
    email: string;
    ho_ten: string | null;
    vai_tro_id: string;
  };
  sinh_vien: {
    id: string;
    nguoi_dung_id: string;
    mssv: string;
    lop_id: string;
  };
}

/**
 * Registration data for charts
 */
export interface RegistrationForCharts {
  id: string;
  sv_id: string;
  sinh_vien: {
    nguoi_dung?: {
      ho_ten: string | null;
    };
  };
  hoat_dong: {
    id: string;
    ngay_bd: Date;
    diem_rl: number | null;
    loai_hd?: {
      ten_loai_hd: string;
    };
  };
  ngay_dang_ky: Date;
  trang_thai_dk: string;
}

/**
 * Registration data for reports
 */
export interface RegistrationForReports {
  id: string;
  sv_id: string;
  sinh_vien: {
    mssv?: string;
    nguoi_dung?: {
      ho_ten: string | null;
    };
  };
  hoat_dong: {
    id: string;
    diem_rl: number | null;
    loai_hd?: {
      ten_loai_hd: string;
    };
  };
  ngay_dang_ky: Date;
}

/**
 * Abstract base class for ITeacherRepository
 * Provides default implementations that throw "not implemented" errors
 */
export abstract class BaseTeacherRepository implements ITeacherRepository {
  async getDashboardStats(_teacherId: string, _semester?: string | null, _classId?: string | null): Promise<TeacherDashboardStats> {
    throw new Error('Method not implemented');
  }

  async getPendingActivitiesList(_teacherId: string, _semester?: string | null, _limit?: number, _classId?: string | null): Promise<PendingActivity[]> {
    throw new Error('Method not implemented');
  }

  async getTeacherClasses(_teacherId: string, _include?: TeacherClassIncludeOptions): Promise<TeacherClass[]> {
    throw new Error('Method not implemented');
  }

  async getTeacherStudents(_teacherId: string, _filters?: TeacherStudentFilters): Promise<TeacherStudent[]> {
    throw new Error('Method not implemented');
  }

  async getClassStats(_className: string, _semesterId?: string | null): Promise<ClassStats> {
    throw new Error('Method not implemented');
  }

  async getClassRegistrations(_classIds: string[], _filters?: ClassRegistrationFilters): Promise<ClassRegistration[]> {
    throw new Error('Method not implemented');
  }

  async hasAccessToClass(_teacherId: string, _className: string): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  async assignClassMonitor(_teacherId: string, _classId: string, _studentId: string): Promise<{ classId: string; monitorStudentId: string }> {
    throw new Error('Method not implemented');
  }

  async createStudent(_teacherId: string, _payload: CreateStudentPayload): Promise<CreateStudentResult> {
    throw new Error('Method not implemented');
  }

  async updateStudent(_teacherId: string, _studentId: string, _payload: UpdateStudentPayload): Promise<CreateStudentResult> {
    throw new Error('Method not implemented');
  }

  async deleteStudent(_teacherId: string, _studentId: string): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  async exportStudents(_teacherId: string): Promise<TeacherStudent[]> {
    throw new Error('Method not implemented');
  }

  async getTeacherClassNames(_teacherId: string): Promise<string[]> {
    throw new Error('Method not implemented');
  }

  async getTeacherClassRegistrationsForChartsAll(_teacherId: string, _semesterId?: string | null): Promise<RegistrationForCharts[]> {
    throw new Error('Method not implemented');
  }

  async getTeacherClassRegistrationsForReports(_teacherId: string, _semesterId?: string | null): Promise<RegistrationForReports[]> {
    throw new Error('Method not implemented');
  }

  async countActivitiesForTeacherClassesStrict(_teacherId: string, _semesterId?: string | null): Promise<number> {
    throw new Error('Method not implemented');
  }
}

export default BaseTeacherRepository;
