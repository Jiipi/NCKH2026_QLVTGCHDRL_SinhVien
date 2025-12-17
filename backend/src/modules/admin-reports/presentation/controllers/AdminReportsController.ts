/**
 * Admin Reports Controller
 * Handles HTTP requests for admin reports
 */
import type { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import type GetOverviewUseCase from '../../business/services/GetOverviewUseCase';
import type GetClassesListUseCase from '../../business/services/GetClassesListUseCase';
import type GetAttendanceReportUseCase from '../../business/services/GetAttendanceReportUseCase';
import type GetUserPointsReportUseCase from '../../business/services/GetUserPointsReportUseCase';
import type ExportActivitiesUseCase from '../../business/services/ExportActivitiesUseCase';
import type ExportRegistrationsUseCase from '../../business/services/ExportRegistrationsUseCase';

interface AdminReportsUseCases {
  getUserPointsReport: GetUserPointsReportUseCase;
  getAttendanceReport: GetAttendanceReportUseCase;
  getClassesList: GetClassesListUseCase;
  getOverview: GetOverviewUseCase;
  exportActivities: ExportActivitiesUseCase;
  exportRegistrations: ExportRegistrationsUseCase;
}

class AdminReportsController {
  private useCases: AdminReportsUseCases;

  constructor(useCases: AdminReportsUseCases) {
    this.useCases = useCases;
  }

  async getUserPointsReport(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = await this.useCases.getUserPointsReport.execute(id, req.query as Record<string, string>);
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy điểm rèn luyện thành công'));
    } catch (err: unknown) {
      logError('Error fetching user points report:', err as Error);
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || (error.message === 'Không tìm thấy người dùng' ? 404 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi lấy điểm rèn luyện', statusCode));
    }
  }

  async getAttendanceReport(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.useCases.getAttendanceReport.execute(req.query as Record<string, unknown>);
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy danh sách điểm danh thành công'));
    } catch (err) {
      logError('Error fetching attendance report:', err as Error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách điểm danh', 500));
    }
  }

  async getClassesList(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.useCases.getClassesList.execute();
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy danh sách lớp thành công'));
    } catch (err) {
      logError('Error fetching classes list:', err as Error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách lớp', 500));
    }
  }

  async getOverview(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.useCases.getOverview.execute(req.query as Record<string, string>);
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy báo cáo tổng quan thành công'));
    } catch (err: unknown) {
      logError('Error fetching overview:', err as Error);
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || (error.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi lấy báo cáo', statusCode));
    }
  }

  async exportActivities(req: Request, res: Response): Promise<Response | void> {
    try {
      const csv = await this.useCases.exportActivities.execute(req.query as Record<string, string>);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
      return res.status(200).send(csv);
    } catch (err: unknown) {
      logError('Error exporting activities:', err as Error);
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || (error.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi xuất hoạt động', statusCode));
    }
  }

  async exportRegistrations(req: Request, res: Response): Promise<Response | void> {
    try {
      const csv = await this.useCases.exportRegistrations.execute(req.query as Record<string, string>);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      return res.status(200).send(csv);
    } catch (err: unknown) {
      logError('Error exporting registrations:', err as Error);
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || (error.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi xuất đăng ký', statusCode));
    }
  }
}

export default AdminReportsController;
module.exports = AdminReportsController;
