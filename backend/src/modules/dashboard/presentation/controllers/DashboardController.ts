/**
 * DashboardController
 * Handles HTTP requests for dashboard module
 */

import type { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type GetStudentDashboardUseCase from '../../business/services/GetStudentDashboardUseCase';
import type GetActivityStatsUseCase from '../../business/services/GetActivityStatsUseCase';
import type GetAdminDashboardUseCase from '../../business/services/GetAdminDashboardUseCase';
import type GetMyActivitiesUseCase from '../../business/services/GetMyActivitiesUseCase';
import type GetDetailedScoresUseCase from '../../business/services/GetDetailedScoresUseCase';
import type GetAdminChartStatsUseCase from '../../business/services/GetAdminChartStatsUseCase';
import type { StudentDashboardQuery } from '../../business/services/GetStudentDashboardUseCase';
import type { DetailedScoresQuery } from '../../business/services/GetDetailedScoresUseCase';

export interface DashboardUseCases {
  getStudentDashboard: GetStudentDashboardUseCase;
  getActivityStats: GetActivityStatsUseCase;
  getAdminDashboard: GetAdminDashboardUseCase;
  getMyActivities: GetMyActivitiesUseCase;
  getDetailedScores: GetDetailedScoresUseCase;
  getAdminChartStats: GetAdminChartStatsUseCase;
}

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
    [key: string]: string;
  };
  scope?: {
    where: any;
    permissions: {
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      canApprove: boolean;
    };
  };
  semester?: {
    hoc_ky: string;
    nam_hoc: string;
  };
}

class DashboardController {
  private useCases: DashboardUseCases;

  constructor(useCases: DashboardUseCases) {
    this.useCases = useCases;
  }

  async getStudentDashboard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user.sub;
      const scope = req.scope;
      const semester = req.semester;
      
      const data = await this.useCases.getStudentDashboard.execute(
        userId, 
        req.query as unknown as StudentDashboardQuery,
        scope,
        semester
      );
      
      return sendResponse(res, 200, ApiResponse.success({
        ...data,
        meta: {
          role: req.user.role,
          semester,
          permissions: scope?.permissions
        }
      }, 'Dữ liệu dashboard sinh viên'));
    } catch (error) {
      logError('Get student dashboard error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error((error as Error).message || 'Lỗi khi lấy dữ liệu dashboard'));
    }
  }

  async getActivityStats(req: Request, res: Response): Promise<Response> {
    try {
      const { timeRange = '30d' } = req.query;
      const data = await this.useCases.getActivityStats.execute(timeRange as string);
      return sendResponse(res, 200, ApiResponse.success(data, 'Thống kê hoạt động'));
    } catch (error) {
      logError('Get activity stats error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê hoạt động'));
    }
  }

  async getAdminDashboard(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const scope = req.scope;
      const semester = req.semester;
      
      const data = await this.useCases.getAdminDashboard.execute(scope, semester);
      
      return sendResponse(res, 200, ApiResponse.success({
        ...data,
        meta: {
          role: req.user.role,
          semester,
          permissions: scope?.permissions
        }
      }, 'Lấy dashboard thành công'));
    } catch (error) {
      logError('Get admin dashboard error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy dữ liệu dashboard'));
    }
  }

  async getMyActivities(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user.sub;
      const { semester, semesterValue, hoc_ky, nam_hoc } = req.query;
      const semesterParam = (semesterValue || semester) as string | undefined;
      const myActivities = await this.useCases.getMyActivities.execute(userId, {
        semester: semesterParam,
        hoc_ky: hoc_ky as string | undefined,
        nam_hoc: nam_hoc as string | undefined
      });
      return sendResponse(res, 200, ApiResponse.success(myActivities, 'Danh sách hoạt động của tôi'));
    } catch (error) {
      logError('Get my activities error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách hoạt động'));
    }
  }

  async getDetailedScores(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user.sub;
      // Pass full query to ensure semester parsing is consistent with getStudentDashboard
      const data = await this.useCases.getDetailedScores.execute(userId, req.query as unknown as DetailedScoresQuery);
      return sendResponse(res, 200, ApiResponse.success(data, 'Chi tiết điểm rèn luyện'));
    } catch (error) {
      logError('Get detailed scores error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết điểm'));
    }
  }

  async getAdminChartStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const semester = req.semester;
      const data = await this.useCases.getAdminChartStats.execute(semester);
      return sendResponse(res, 200, ApiResponse.success(data, 'Dữ liệu biểu đồ admin'));
    } catch (error) {
      logError('Get admin chart stats error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy dữ liệu biểu đồ'));
    }
  }
}

export default DashboardController;
