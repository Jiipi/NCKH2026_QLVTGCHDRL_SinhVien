/**
 * TeacherPrismaRepository
 * Prisma implementation of ITeacherRepository using Composition Pattern
 * 
 * This class composes specialized repositories to implement ITeacherRepository interface
 * Follows Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP)
 */

import { BaseTeacherRepository, type ITeacherRepository, type CreateStudentPayload, type CreateStudentResult, type RegistrationForCharts, type RegistrationForReports } from '../../business/interfaces/ITeacherRepository';
import TeacherDashboardRepository, { type DashboardStats, type ClassStatsResult } from './TeacherDashboardRepository';
import TeacherClassRepository, { type AssignMonitorResult } from './TeacherClassRepository';
import TeacherStudentRepository, { type ExportStudentData } from './TeacherStudentRepository';
import TeacherActivityRepository from './TeacherActivityRepository';
import TeacherRegistrationRepository, { type ClassRegistrationFilters } from './TeacherRegistrationRepository';
import type { TeacherDashboardStats, ClassStats, TeacherClass, TeacherClassIncludeOptions, TeacherStudentFilters, TeacherStudent, PendingActivity, ClassRegistration } from '../../teachers.types';
import type { Prisma } from '@prisma/client';

interface ClassWithCount {
  id: string;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  _count?: {
    sinh_viens?: number;
  };
}

interface RegistrationWithRelations {
  id: string;
  trang_thai_dk: string;
  ngay_dang_ky: Date;
  sinh_vien?: {
    id: string;
    mssv: string;
    nguoi_dung?: {
      ho_ten: string | null;
    } | null;
  } | null;
  hoat_dong?: {
    ten_hd: string;
  } | null;
}

/**
 * Interfaces for Dependency Injection
 * TODO: Extract these to a separate interfaces file and use a DI container
 * (e.g., tsyringe, inversify) to inject these dependencies.
 * This would enable unit testing by allowing mock repositories to be injected.
 */
interface ITeacherSubRepositories {
  dashboardRepo: TeacherDashboardRepository;
  classRepo: TeacherClassRepository;
  studentRepo: TeacherStudentRepository;
  activityRepo: TeacherActivityRepository;
  registrationRepo: TeacherRegistrationRepository;
}

/**
 * TeacherPrismaRepository - Composition Pattern
 * Implements ITeacherRepository by delegating to specialized repositories
 * 
 * TODO: Refactor to accept sub-repositories via constructor injection for testability:
 * ```
 * constructor(deps: ITeacherSubRepositories) {
 *   this.dashboardRepo = deps.dashboardRepo;
 *   // ...
 * }
 * ```
 */
class TeacherPrismaRepository extends BaseTeacherRepository {
  private dashboardRepo: TeacherDashboardRepository;
  private classRepo: TeacherClassRepository;
  private studentRepo: TeacherStudentRepository;
  private activityRepo: TeacherActivityRepository;
  private registrationRepo: TeacherRegistrationRepository;

  constructor(deps?: Partial<ITeacherSubRepositories>) {
    super();
    // Compose specialized repositories (hardcoded for now, see TODO above)
    this.dashboardRepo = deps?.dashboardRepo ?? new TeacherDashboardRepository();
    this.classRepo = deps?.classRepo ?? new TeacherClassRepository();
    this.studentRepo = deps?.studentRepo ?? new TeacherStudentRepository();
    this.activityRepo = deps?.activityRepo ?? new TeacherActivityRepository();
    this.registrationRepo = deps?.registrationRepo ?? new TeacherRegistrationRepository();
  }

  // ==================== DASHBOARD METHODS ====================
  async getDashboardStats(teacherId: string, semester: string | null = null, classId: string | null = null): Promise<TeacherDashboardStats> {
    const stats = await this.dashboardRepo.getDashboardStats(teacherId, semester, classId);
    // Map to TeacherDashboardStats interface
    return {
      totalClasses: 0, // Not directly available from dashboard stats
      totalStudents: stats.totalStudents,
      pendingRegistrations: stats.pendingApprovals,
      upcomingActivities: stats.totalActivities,
      classStats: []
    };
  }

  async getClassStats(className: string, semesterId: string | null = null): Promise<ClassStats> {
    const stats = await this.dashboardRepo.getClassStats(className, semesterId);
    // Map to ClassStats interface
    return {
      className,
      studentCount: stats.totalStudents,
      attendanceRate: stats.totalRegistrations > 0 ? Math.round((stats.approvedRegistrations / stats.totalRegistrations) * 100) : 0,
      avgPoints: 0, // Would need additional calculation
      totalStudents: stats.totalStudents,
      totalActivities: stats.totalActivities,
      approvedActivities: stats.approvedActivities,
      totalRegistrations: stats.totalRegistrations,
      approvedRegistrations: stats.approvedRegistrations
    };
  }

  // ==================== CLASS METHODS ====================
  async getTeacherClasses(teacherId: string, include: TeacherClassIncludeOptions = {}): Promise<TeacherClass[]> {
    const prismaInclude: Prisma.LopInclude = {};
    if (include.students) {
      prismaInclude.sinh_viens = true;
    }
    if (include.monitor) {
      prismaInclude.lop_truong_rel = true;
    }
    const classes = await this.classRepo.getTeacherClasses(teacherId, prismaInclude) as unknown as ClassWithCount[];
    return classes.map(c => ({
      id: String(c.id),
      ten_lop: c.ten_lop,
      khoa: c.khoa,
      nien_khoa: c.nien_khoa,
      studentCount: c._count?.sinh_viens || 0
    }));
  }

  async getTeacherClassNames(teacherId: string): Promise<string[]> {
    return this.classRepo.getTeacherClassNames(teacherId);
  }

  async hasAccessToClass(teacherId: string, className: string): Promise<boolean> {
    return this.classRepo.hasAccessToClass(teacherId, className);
  }

  async assignClassMonitor(teacherId: string, classId: string, studentId: string): Promise<{ classId: string; monitorStudentId: string }> {
    return this.classRepo.assignClassMonitor(teacherId, classId, studentId);
  }

  // ==================== STUDENT METHODS ====================
  async getTeacherStudents(teacherId: string, filters: TeacherStudentFilters = {}): Promise<TeacherStudent[]> {
    const students = await this.studentRepo.getTeacherStudents(teacherId, {
      search: filters.search,
      classId: filters.classId?.toString(),
      semester: filters.semester
    });
    return students.map(s => ({
      id: String(s.id),
      mssv: s.mssv,
      nguoi_dung_id: String(s.nguoi_dung_id),
      lop_id: s.lop_id ? String(s.lop_id) : null,
      name: s.nguoi_dung?.ho_ten ?? null,
      email: s.nguoi_dung?.email ?? null,
      className: s.lop?.ten_lop ?? null,
      dang_ky_hd: s.dang_ky_hd
    }));
  }

  async exportStudents(teacherId: string): Promise<TeacherStudent[]> {
    const students = await this.studentRepo.exportStudents(teacherId);
    return students.map(s => ({
      id: '',
      mssv: s.mssv,
      nguoi_dung_id: '',
      lop_id: null,
      name: s.ho_ten ?? null,
      email: s.email ?? null,
      className: s.lop ?? null
    }));
  }

  async createStudent(teacherId: string, payload: CreateStudentPayload): Promise<CreateStudentResult> {
    return this.studentRepo.createStudent(teacherId, payload);
  }

  async updateStudent(teacherId: string, studentId: string, payload: import('../../business/interfaces/ITeacherRepository').UpdateStudentPayload): Promise<CreateStudentResult> {
    return this.studentRepo.updateStudent(teacherId, studentId, payload);
  }

  async deleteStudent(teacherId: string, studentId: string): Promise<boolean> {
    return this.studentRepo.deleteStudent(teacherId, studentId);
  }

  // ==================== ACTIVITY METHODS ====================
  async getPendingActivitiesList(teacherId: string, semester: string | null = null, limit: number = 10, classId: string | null = null): Promise<PendingActivity[]> {
    const activities = await this.activityRepo.getPendingActivitiesList(teacherId, semester, limit, classId);
    return activities.map(a => ({
      id: String(a.id),
      ten_hd: a.ten_hd,
      ngay_bd: a.ngay_bd,
      registrationCount: 0,
      pendingCount: 0
    }));
  }

  async countActivitiesForTeacherClassesStrict(teacherId: string, semesterId: string | null = null): Promise<number> {
    return this.activityRepo.countActivitiesForTeacherClassesStrict(teacherId, semesterId);
  }

  // ==================== REGISTRATION METHODS ====================
  async getClassRegistrations(classIds: string[], filters: ClassRegistrationFilters = {}): Promise<ClassRegistration[]> {
    const registrations = await this.registrationRepo.getClassRegistrations(classIds, filters);
    return registrations as unknown as ClassRegistration[];
  }

  async getTeacherClassRegistrationsForChartsAll(teacherId: string, semesterId: string | null = null): Promise<RegistrationForCharts[]> {
    return this.registrationRepo.getTeacherClassRegistrationsForChartsAll(teacherId, semesterId);
  }

  async getTeacherClassRegistrationsForReports(teacherId: string, semesterId: string | null = null): Promise<RegistrationForReports[]> {
    return this.registrationRepo.getTeacherClassRegistrationsForReports(teacherId, semesterId);
  }
}

export default TeacherPrismaRepository;
