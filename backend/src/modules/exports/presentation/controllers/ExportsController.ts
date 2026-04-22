/**
 * ExportsController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */

import { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type GetOverviewUseCase from '../../business/services/GetOverviewUseCase';
import type ExportActivitiesUseCase from '../../business/services/ExportActivitiesUseCase';
import type ExportRegistrationsUseCase from '../../business/services/ExportRegistrationsUseCase';

interface UseCases {
  getOverview: GetOverviewUseCase;
  exportActivities: ExportActivitiesUseCase;
  exportRegistrations: ExportRegistrationsUseCase;
}

class ExportsController {
  private useCases: UseCases;

  constructor(useCases: UseCases) {
    this.useCases = useCases;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'UNKNOWN';
  }

  async getOverview(req: Request, res: Response): Promise<Response> {
    try {
      const { semester, hoc_ky, nam_hoc } = (req.query || {}) as { 
        semester?: string; 
        hoc_ky?: string; 
        nam_hoc?: string; 
      };
      const data = await this.useCases.getOverview.execute({ semester, hoc_ky, nam_hoc });
      return sendResponse(res, 200, ApiResponse.success(data));
    } catch (error: unknown) {
      logError('Get overview error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy báo cáo'));
    }
  }

  async exportActivities(req: Request, res: Response): Promise<void> {
    try {
      const { semester, hoc_ky, nam_hoc } = (req.query || {}) as { 
        semester?: string; 
        hoc_ky?: string; 
        nam_hoc?: string; 
      };
      const csv = await this.useCases.exportActivities.execute({ semester, hoc_ky, nam_hoc });
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
      res.status(200).send(csv);
    } catch (error: unknown) {
      logError('Export activities error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error(`Lỗi xuất hoạt động: ${this.getErrorMessage(error)}`));
    }
  }

  async exportRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const { semester, hoc_ky, nam_hoc } = (req.query || {}) as { 
        semester?: string; 
        hoc_ky?: string; 
        nam_hoc?: string; 
      };
      const csv = await this.useCases.exportRegistrations.execute({ semester, hoc_ky, nam_hoc });
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      res.status(200).send(csv);
    } catch (error: unknown) {
      logError('Export registrations error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error(`Lỗi xuất đăng ký: ${this.getErrorMessage(error)}`));
    }
  }
}

export default ExportsController;
module.exports = ExportsController;
