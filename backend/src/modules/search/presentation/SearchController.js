const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * SearchController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class SearchController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async globalSearch(req, res) {
    try {
      const { q } = req.query;
      const user = req.user;

      const results = await this.useCases.globalSearch.execute(q, user);
      
      return sendResponse(res, 200, ApiResponse.success(results));
    } catch (error) {
      logError('Global search error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi tìm kiếm'));
    }
  }
}

module.exports = SearchController;

