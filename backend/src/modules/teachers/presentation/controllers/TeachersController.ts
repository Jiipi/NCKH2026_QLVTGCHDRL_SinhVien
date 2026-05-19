/**
 * TeachersController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */

import type { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import XLSX from 'xlsx';

// Import use case types
import type GetTeacherDashboardUseCase from '../../business/services/GetTeacherDashboardUseCase';
import type GetTeacherClassesUseCase from '../../business/services/GetTeacherClassesUseCase';
import type GetTeacherStudentsUseCase from '../../business/services/GetTeacherStudentsUseCase';
import type GetPendingActivitiesUseCase from '../../business/services/GetPendingActivitiesUseCase';
import type GetActivityHistoryUseCase from '../../business/services/GetActivityHistoryUseCase';
import type ApproveActivityUseCase from '../../business/services/ApproveActivityUseCase';
import type RejectActivityUseCase from '../../business/services/RejectActivityUseCase';
import type GetAllRegistrationsUseCase from '../../business/services/GetAllRegistrationsUseCase';
import type GetPendingRegistrationsUseCase from '../../business/services/GetPendingRegistrationsUseCase';
import type ApproveRegistrationUseCase from '../../business/services/ApproveRegistrationUseCase';
import type RejectRegistrationUseCase from '../../business/services/RejectRegistrationUseCase';
import type BulkApproveRegistrationsUseCase from '../../business/services/BulkApproveRegistrationsUseCase';
import type GetClassStatisticsUseCase from '../../business/services/GetClassStatisticsUseCase';
import type AssignClassMonitorUseCase from '../../business/services/AssignClassMonitorUseCase';
import type CreateStudentUseCase from '../../business/services/CreateStudentUseCase';
import type UpdateStudentUseCase from '../../business/services/UpdateStudentUseCase';
import type DeleteStudentUseCase from '../../business/services/DeleteStudentUseCase';
import type ExportStudentsUseCase from '../../business/services/ExportStudentsUseCase';
import type { TeacherStudent } from '../../teachers.types';
import type GetReportStatisticsUseCase from '../../business/services/GetReportStatisticsUseCase';
import { parseSemesterString } from '../../../../core/utils/semester';
import type { HocKy, Prisma } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    id: string;
    role: string;
    vai_tro_id?: string;
    vai_tro?: { ten_vt: string };
  };
  semester?: {
    hoc_ky: string;
    nam_hoc: string;
    key: string;
  };
}

export interface TeachersUseCases {
  getDashboard: GetTeacherDashboardUseCase;
  getClasses: GetTeacherClassesUseCase;
  getStudents: GetTeacherStudentsUseCase;
  getPendingActivities: GetPendingActivitiesUseCase;
  getActivityHistory: GetActivityHistoryUseCase;
  approveActivity: ApproveActivityUseCase;
  rejectActivity: RejectActivityUseCase;
  getAllRegistrations: GetAllRegistrationsUseCase;
  getPendingRegistrations: GetPendingRegistrationsUseCase;
  approveRegistration: ApproveRegistrationUseCase;
  rejectRegistration: RejectRegistrationUseCase;
  bulkApproveRegistrations: BulkApproveRegistrationsUseCase;
  getClassStatistics: GetClassStatisticsUseCase;
  assignClassMonitor: AssignClassMonitorUseCase;
  createStudent: CreateStudentUseCase;
  updateStudent: UpdateStudentUseCase;
  deleteStudent: DeleteStudentUseCase;
  exportStudents: ExportStudentsUseCase;
  getReportStatistics: GetReportStatisticsUseCase;
}

/**
 * TeachersController class
 */
class TeachersController {
  private useCases: TeachersUseCases;

  constructor(useCases: TeachersUseCases) {
    this.useCases = useCases;
  }

  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { semester, classId } = req.query;
      const dashboard = await this.useCases.getDashboard.execute(
        req.user!,
        semester as string | undefined,
        classId as string | undefined
      );
      return sendResponse(res, 200, ApiResponse.success(dashboard));
    } catch (error) {
      logError('Get teacher dashboard error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy dashboard'));
    }
  }

  async getClasses(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const classes = await this.useCases.getClasses.execute(req.user!);
      return sendResponse(res, 200, ApiResponse.success(classes));
    } catch (error) {
      logError('Get teacher classes error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách lớp'));
    }
  }

  async getStudents(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { class: className, classId, classFilter, search, semester } = req.query;
      const filters: Record<string, string> = {};
      if (classId) filters.classId = String(classId);
      else if (classFilter) filters.classId = String(classFilter);
      else if (className) filters.class = String(className);
      if (search) filters.search = String(search);
      if (semester) filters.semester = String(semester);

      const students = await this.useCases.getStudents.execute(req.user!, filters);
      return sendResponse(res, 200, ApiResponse.success(students));
    } catch (error) {
      logError('Get teacher students error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách sinh viên'));
    }
  }

  async getPendingActivities(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { page, limit, semester } = req.query;
      const result = await this.useCases.getPendingActivities.execute(req.user!, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        semester: semester as string | undefined
      });

      const stats = await this.computeActivityStats(req.user!.sub, semester as string | undefined);
      const payload = (result && typeof result === 'object') ? { ...result as Record<string, unknown>, stats } : { items: result, stats };
      return sendResponse(res, 200, ApiResponse.success(payload));
    } catch (error) {
      logError('Get pending activities error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy hoạt động chờ duyệt'));
    }
  }

  private async computeActivityStats(teacherId: string, semester: string | undefined): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    const classes = await prisma.lop.findMany({ where: { chu_nhiem: teacherId }, select: { id: true } });
    const classIds = classes.map(c => c.id);
    if (classIds.length === 0) return { total: 0, pending: 0, approved: 0, rejected: 0 };

    const where: Prisma.HoatDongWhereInput = { lop_id: { in: classIds } };
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        where.hoc_ky = parsed.semester as HocKy;
        where.nam_hoc = parsed.year;
      }
    }

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.hoatDong.count({ where }),
      prisma.hoatDong.count({ where: { ...where, trang_thai: 'cho_duyet' } }),
      prisma.hoatDong.count({ where: { ...where, trang_thai: 'da_duyet' } }),
      prisma.hoatDong.count({ where: { ...where, trang_thai: 'tu_choi' } })
    ]);

    return { total, pending, approved, rejected };
  }

  async getActivityHistory(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { page, limit, semester } = req.query;
      const pageNum = page ? Number(page) : undefined;
      const limitNum = limit ? Number(limit) : undefined;

      const result = await this.useCases.getActivityHistory.execute(
        req.user!,
        {
          semester: semester as string | undefined
        },
        {
          page: pageNum,
          limit: limitNum
        }
      );
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Get activity history error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử hoạt động'));
    }
  }

  async approveActivity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const activity = await this.useCases.approveActivity.execute(req.params.id, req.user!, req.semester);
      return sendResponse(res, 200, ApiResponse.success(activity, 'Đã duyệt hoạt động thành công'));
    } catch (error) {
      logError('Approve activity error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt hoạt động'));
    }
  }

  async rejectActivity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { reason } = req.body;
      const activity = await this.useCases.rejectActivity.execute(req.params.id, reason, req.user!, req.semester);
      return sendResponse(res, 200, ApiResponse.success(activity, 'Đã từ chối hoạt động'));
    } catch (error) {
      logError('Reject activity error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi từ chối hoạt động'));
    }
  }

  async getAllRegistrations(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { status, semester, semesterId, classId, classFilter } = req.query;
      const filters: Record<string, string> = {};
      
      if (status) filters.status = String(status);
      if (semester || semesterId) filters.semester = String(semester || semesterId);
      if (classId || classFilter) filters.classId = String(classId || classFilter);

      const registrations = await this.useCases.getAllRegistrations.execute(req.user!, filters);
      return sendResponse(res, 200, ApiResponse.success(registrations));
    } catch (error) {
      logError('Get all registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy đăng ký'));
    }
  }

  async getPendingRegistrations(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { semester, semesterId, classId, classFilter } = req.query;
      const filters: Record<string, string> = {};

      if (semester || semesterId) filters.semester = String(semester || semesterId);
      if (classId || classFilter) filters.classId = String(classId || classFilter);

      const registrations = await this.useCases.getPendingRegistrations.execute(req.user!, filters);
      const counts = await this.computeRegistrationCounts(req.user!.sub, filters.semester, filters.classId);
      const payload = (registrations && typeof registrations === 'object') ? { ...registrations as Record<string, unknown>, counts } : { items: registrations, counts };
      return sendResponse(res, 200, ApiResponse.success(payload));
    } catch (error) {
      logError('Get pending registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy đăng ký chờ duyệt'));
    }
  }

  private async computeRegistrationCounts(teacherId: string, semester: string | undefined, classId: string | undefined): Promise<{ cho_duyet: number; da_duyet: number; tu_choi: number; da_tham_gia: number }> {
    let classes = await prisma.lop.findMany({ where: { chu_nhiem: teacherId }, select: { id: true } });
    if (classId) classes = classes.filter(c => c.id === classId);
    const classIds = classes.map(c => c.id);
    if (classIds.length === 0) return { cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 };

    const where: Prisma.DangKyHoatDongWhereInput = { sinh_vien: { lop_id: { in: classIds } } };
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        where.hoat_dong = { is: { hoc_ky: parsed.semester as HocKy, nam_hoc: parsed.year } };
      }
    }

    const [cho_duyet, da_duyet, tu_choi, da_tham_gia] = await Promise.all([
      prisma.dangKyHoatDong.count({ where: { ...where, trang_thai_dk: 'cho_duyet' } }),
      prisma.dangKyHoatDong.count({ where: { ...where, trang_thai_dk: 'da_duyet' } }),
      prisma.dangKyHoatDong.count({ where: { ...where, trang_thai_dk: 'tu_choi' } }),
      prisma.dangKyHoatDong.count({ where: { ...where, trang_thai_dk: 'da_tham_gia' } })
    ]);

    return { cho_duyet, da_duyet, tu_choi, da_tham_gia };
  }

  async approveRegistration(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const registration = await this.useCases.approveRegistration.execute(req.params.id, req.user!);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Đã duyệt đăng ký thành công'));
    } catch (error) {
      logError('Approve registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt đăng ký'));
    }
  }

  async rejectRegistration(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { reason } = req.body;
      const registration = await this.useCases.rejectRegistration.execute(req.params.id, reason, req.user!);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Đã từ chối đăng ký'));
    } catch (error) {
      logError('Reject registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi từ chối đăng ký'));
    }
  }

  async bulkApproveRegistrations(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return sendResponse(res, 400, ApiResponse.error('ids phải là array'));
      }
      const result = await this.useCases.bulkApproveRegistrations.execute(ids, req.user!);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Bulk approve registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt hàng loạt đăng ký'));
    }
  }

  async getClassStatistics(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { semesterId } = req.query;
      const stats = await this.useCases.getClassStatistics.execute(
        req.params.className,
        semesterId as string | undefined,
        req.user!
      );
      return sendResponse(res, 200, ApiResponse.success(stats));
    } catch (error) {
      logError('Get class statistics error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê lớp'));
    }
  }

  async getClassStatisticsById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { semesterId } = req.query;

      const lop = await prisma.lop.findUnique({ where: { id: String(id) }, select: { ten_lop: true } });
      if (!lop) {
        return sendResponse(res, 200, ApiResponse.success({
          totalStudents: 0,
          totalActivities: 0,
          approvedActivities: 0,
          totalRegistrations: 0,
          approvedRegistrations: 0
        }));
      }

      const stats = await this.useCases.getClassStatistics.execute(
        lop.ten_lop,
        semesterId as string | undefined,
        req.user!
      );
      return sendResponse(res, 200, ApiResponse.success(stats));
    } catch (error) {
      logError('Get class statistics by ID error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê lớp'));
    }
  }

  async assignClassMonitor(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { sinh_vien_id } = req.body || {};

      if (!sinh_vien_id) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu sinh_vien_id'));
      }

      const result = await this.useCases.assignClassMonitor.execute(String(id), String(sinh_vien_id), req.user!);
      return sendResponse(res, 200, ApiResponse.success(result, 'Gán lớp trưởng thành công'));
    } catch (error) {
      logError('Assign class monitor error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi gán lớp trưởng'));
    }
  }

  async createStudent(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const result = await this.useCases.createStudent.execute(req.user!, req.body);
      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo sinh viên thành công'));
    } catch (error) {
      logError('Create student error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi tạo sinh viên'));
    }
  }

  async updateStudent(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const result = await this.useCases.updateStudent.execute(req.user!, req.params.id, req.body);
      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật sinh viên thành công'));
    } catch (error) {
      logError('Update student error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi cập nhật sinh viên'));
    }
  }

  async deleteStudent(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const ok = await this.useCases.deleteStudent.execute(req.user!, req.params.id);
      if (!ok) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy sinh viên hoặc không có quyền xoá'));
      }
      return sendResponse(res, 200, ApiResponse.success(null, 'Xoá sinh viên thành công'));
    } catch (error) {
      logError('Delete student error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi xoá sinh viên'));
    }
  }

  async exportStudents(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const format = String(req.query.format || 'xlsx').toLowerCase();
      const students = await this.useCases.exportStudents.execute(req.user!);

      const rows = students.map((s: TeacherStudent & Record<string, unknown>) => ({
        MSSV: s.mssv,
        'Họ và tên': s.ho_ten,
        Email: s.email,
        Lớp: s.lop,
        Khoa: s.khoa,
        'Niên khóa': s.nien_khoa,
        'Số điện thoại': s.sdt || ''
      }));

      const dateStr = new Date().toISOString().slice(0, 10);
      if (format === 'csv') {
        const headers = Object.keys(rows[0] || {
          MSSV: '', 'Họ và tên': '', Email: '', Lớp: '', Khoa: '', 'Niên khóa': '', 'Số điện thoại': ''
        });
        const escape = (v: unknown): string => {
          const s = v == null ? '' : String(v);
          if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
          return s;
        };
        const lines = [headers.join(',')].concat(rows.map((r: Record<string, unknown>) => headers.map(h => escape(r[h])).join(',')));
        const csv = '\uFEFF' + lines.join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="danh_sach_sinh_vien_${dateStr}.csv"`);
        return res.status(200).send(csv);
      }

      const ws = XLSX.utils.json_to_sheet(rows, { cellDates: true, dateNF: 'yyyy-mm-dd' });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SinhVien');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer', bookSST: true });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="danh_sach_sinh_vien_${dateStr}.xlsx"`);
      return res.status(200).send(buffer);
    } catch (error) {
      logError('Export students error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi export sinh viên'));
    }
  }

  async getReportStatistics(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { semesterId, semester } = req.query;
      const sem = (semesterId || semester || null) as string | null;
      
      const stats = await this.useCases.getReportStatistics.execute(req.user!, {
        semesterId: sem
      });
      
      return sendResponse(res, 200, ApiResponse.success(stats));
    } catch (error) {
      logError('Get report statistics error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê báo cáo'));
    }
  }
}

export default TeachersController;
