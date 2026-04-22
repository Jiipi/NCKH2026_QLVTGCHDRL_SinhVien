/**
 * SearchController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */

import { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type GlobalSearchUseCase from '../../business/services/GlobalSearchUseCase';

interface AuthRequest extends Request {
  user?: {
    id?: string;
    sub?: string;
    vai_tro?: { ten_vt?: string };
    role?: string;
  };
}

interface UseCases {
  globalSearch: GlobalSearchUseCase;
}

class SearchController {
  private useCases: UseCases;

  constructor(useCases: UseCases) {
    this.useCases = useCases;
  }

  async globalSearch(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { q } = req.query as { q?: string };
      const user = req.user;

      const results = await this.useCases.globalSearch.execute(q, user || {});
      
      return sendResponse(res, 200, ApiResponse.success(results));
    } catch (error: unknown) {
      logError('Global search error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi tìm kiếm'));
    }
  }
}

export default SearchController;
module.exports = SearchController;
