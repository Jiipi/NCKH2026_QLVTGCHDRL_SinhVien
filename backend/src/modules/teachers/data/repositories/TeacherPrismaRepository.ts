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

/**
 * TeacherPrismaRepository - Composition Pattern
 * Implements ITeacherRepository by delegating to specialized repositories
 */
class TeacherPrismaRepository extends BaseTeacherRepository {
  private dashboardRepo: TeacherDashboardRepository;
  private classRepo: TeacherClassRepository;
  private studentRepo: TeacherStudentRepository;
  private activityRepo: TeacherActivityRepository;
  private registrationRepo: TeacherRegistrationRepository;

  constructor() {
    super();
    // Compose specialized repositories
    this.dashboardRepo = new TeacherDashboardRepository();
    this.classRepo = new TeacherClassRepository();
    this.studentRepo = new TeacherStudentRepository();
    this.activityRepo = new TeacherActivityRepository();
    this.registrationRepo = new TeacherRegistrationRepository();
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
    const classes = await this.classRepo.getTeacherClasses(teacherId, prismaInclude);
    return classes.map(c => ({
      id: String(c.id),
      ten_lop: c.ten_lop,
      khoa: c.khoa,
      nien_khoa: c.nien_khoa,
      studentCount: (c as any)._count?.sinh_viens || 0
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
      semester: undefined
    });
    return students.map(s => ({
      id: String(s.id),
      mssv: s.mssv,
      nguoi_dung_id: String(s.nguoi_dung_id),
      lop_id: s.lop_id ? String(s.lop_id) : null,
      name: s.nguoi_dung?.ho_ten ?? null,
      email: s.nguoi_dung?.email ?? null,
      className: s.lop?.ten_lop ?? null
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
    return registrations.map(r => ({
      id: r.id,
      studentId: (r.sinh_vien as any)?.id || 0,
      studentName: (r.sinh_vien as any)?.nguoi_dung?.ho_ten ?? null,
      mssv: (r.sinh_vien as any)?.mssv || '',
      activityName: (r.hoat_dong as any)?.ten_hd || '',
      status: r.trang_thai_dk,
      registrationDate: r.ngay_dang_ky
    }));
  }

  async getTeacherClassRegistrationsForChartsAll(teacherId: string, semesterId: string | null = null): Promise<RegistrationForCharts[]> {
    return this.registrationRepo.getTeacherClassRegistrationsForChartsAll(teacherId, semesterId);
  }

  async getTeacherClassRegistrationsForReports(teacherId: string, semesterId: string | null = null): Promise<RegistrationForReports[]> {
    return this.registrationRepo.getTeacherClassRegistrationsForReports(teacherId, semesterId);
  }
}

export default TeacherPrismaRepository;
