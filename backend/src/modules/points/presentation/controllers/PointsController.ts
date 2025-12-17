/**
 * PointsController
 * Presentation layer - handles HTTP requests/responses only
 */
import type { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type GetPointsSummaryUseCase from '../../business/services/GetPointsSummaryUseCase';
import type GetPointsDetailUseCase from '../../business/services/GetPointsDetailUseCase';
import type GetAttendanceHistoryUseCase from '../../business/services/GetAttendanceHistoryUseCase';
import type GetFilterOptionsUseCase from '../../business/services/GetFilterOptionsUseCase';
import type GetPointsReportUseCase from '../../business/services/GetPointsReportUseCase';

interface AuthenticatedUser {
  sub?: string;
  id?: string;
  userId?: string;
  uid?: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface PointsUseCases {
  getPointsSummary: GetPointsSummaryUseCase;
  getPointsDetail: GetPointsDetailUseCase;
  getAttendanceHistory: GetAttendanceHistoryUseCase;
  getFilterOptions: GetFilterOptionsUseCase;
  getPointsReport: GetPointsReportUseCase;
}

class PointsController {
  private useCases: PointsUseCases;

  constructor(useCases: PointsUseCases) {
    this.useCases = useCases;
  }

  private _getUserId(req: AuthenticatedRequest): string | null {
    return req.user?.sub || req.user?.id || req.user?.userId || req.user?.uid || null;
  }

  async getPointsSummary(req: Request, res: Response): Promise<Response> {
    try {
      const userId = this._getUserId(req as AuthenticatedRequest);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { semester } = req.query;
      const filters = { semester: semester as string | undefined };

      const result = await this.useCases.getPointsSummary.execute(userId, filters);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching student points summary:', error as Error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin điểm rèn luyện', 500));
    }
  }

  async getPointsDetail(req: Request, res: Response): Promise<Response> {
    try {
      const userId = this._getUserId(req as AuthenticatedRequest);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { semester, page = 1, limit = 10 } = req.query;
      const filters = { semester: semester as string | undefined };
      const pagination = { page: Number(page), limit: Number(limit) };

      const result = await this.useCases.getPointsDetail.execute(userId, filters, pagination);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching student points detail:', error as Error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết điểm rèn luyện', 500));
    }
  }

  async getAttendanceHistory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = this._getUserId(req as AuthenticatedRequest);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { page = 1, limit = 10 } = req.query;
      const pagination = { page: Number(page), limit: Number(limit) };

      const result = await this.useCases.getAttendanceHistory.execute(userId, pagination);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching attendance history:', error as Error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử điểm danh', 500));
    }
  }

  async getFilterOptions(req: Request, res: Response): Promise<Response> {
    try {
      const userId = this._getUserId(req as AuthenticatedRequest);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const result = await this.useCases.getFilterOptions.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting filter options:', error as Error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách bộ lọc', 500));
    }
  }

  async getPointsReport(req: Request, res: Response): Promise<Response> {
    try {
      const userId = this._getUserId(req as AuthenticatedRequest);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { nam_hoc } = req.query;
      const result = await this.useCases.getPointsReport.execute(userId, nam_hoc as string | null);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error generating points report:', error as Error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi tạo báo cáo điểm rèn luyện', 500));
    }
  }
}

export default PointsController;
module.exports = PointsController;
