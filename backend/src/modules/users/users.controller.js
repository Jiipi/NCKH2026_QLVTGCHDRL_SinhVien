/**
 * Users Controller
 * Handles HTTP requests for user management
 */

const usersService = require('./users.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError } = require('../../core/logger');

class UsersController {
  /**
   * @route   GET /api/core/users
   * @desc    Get all users (with pagination and filters)
   * @access  Private (Admin/Teacher)
   */
  static async getAll(req, res) {
    try {
      const { page, limit, search, role, khoa, lop } = req.query;
      
      // Build filters from query params
      const filters = {};
      if (search) filters.search = search;
      // Filter by vai_tro relation if role specified
      if (role) {
        filters.vai_tro = {
          ten_vt: role
        };
      }
      if (khoa) filters.khoa = khoa;
      if (lop) filters.lop = lop;
      
      const pagination = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };
      
      const result = await usersService.list(req.user, filters, pagination);

      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách người dùng'));
    } catch (error) {
      logError('Get users error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách người dùng'));
    }
  }

  /**
   * @route   GET /api/core/users/:id
   * @desc    Get user by ID
   * @access  Private
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await usersService.findById(id, req.user);

      if (!user) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy người dùng'));
      }

      return sendResponse(res, 200, ApiResponse.success(user, 'Thông tin người dùng'));
    } catch (error) {
      logError('Get user by ID error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin người dùng'));
    }
  }

  /**
   * @route   POST /api/core/users
   * @desc    Create new user
   * @access  Private (Admin only)
   */
  static async create(req, res) {
    try {
      const userData = req.body;
      const result = await usersService.create(userData, req.user);

      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo người dùng thành công'));
    } catch (error) {
      logError('Create user error', error);

      if (error.status === 400) {
        return sendResponse(res, 400, ApiResponse.validationError(error.errors || [{ message: error.message }]));
      }

      if (error.status === 409) {
        return sendResponse(res, 409, ApiResponse.error(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không tạo được người dùng'));
    }
  }

  /**
   * @route   PUT /api/core/users/:id
   * @desc    Update user
   * @access  Private (Admin/Self)
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await usersService.update(id, updateData, req.user);

      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật người dùng thành công'));
    } catch (error) {
      logError('Update user error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không cập nhật được người dùng'));
    }
  }

  /**
   * @route   DELETE /api/core/users/:id
   * @desc    Delete user
   * @access  Private (Admin only)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await usersService.delete(id, req.user);

      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa người dùng thành công'));
    } catch (error) {
      logError('Delete user error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không xóa được người dùng'));
    }
  }

  /**
   * @route   GET /api/core/users/search
   * @desc    Search users
   * @access  Private
   */
  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return sendResponse(res, 400, ApiResponse.validationError([{ message: 'Missing search query' }]));
      }
      
      const users = await usersService.search(q, req.user);
      
      return sendResponse(res, 200, ApiResponse.success(users, 'Kết quả tìm kiếm'));
    } catch (error) {
      logError('Search users error', error);
      return sendResponse(res, 500, ApiResponse.error('Không tìm kiếm được người dùng'));
    }
  }

  /**
   * @route   GET /api/core/users/stats
   * @desc    Get user statistics
   * @access  Private (Admin only)
   */
  static async getStats(req, res) {
    try {
      const stats = await usersService.getStats(req.user);
      
      return sendResponse(res, 200, ApiResponse.success(stats, 'Thống kê người dùng'));
    } catch (error) {
      logError('Get user stats error', error);
      
      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thống kê'));
    }
  }

  /**
   * @route   GET /api/core/users/class/:className
   * @desc    Get users by class name
   * @access  Private
   */
  static async getByClass(req, res) {
    try {
      const { className } = req.params;
      const users = await usersService.getByClass(className, req.user);
      
      return sendResponse(res, 200, ApiResponse.success(users, `Danh sách lớp ${className}`));
    } catch (error) {
      logError('Get users by class error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  /**
   * @route   GET /api/core/users/me
   * @desc    Get current user profile
   * @access  Private
   */
  static async getMe(req, res) {
    try {
      const userId = req.user?.sub;
      const user = await usersService.findById(userId, req.user);

      if (!user) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy thông tin người dùng'));
      }

      return sendResponse(res, 200, ApiResponse.success(user, 'Thông tin cá nhân'));
    } catch (error) {
      logError('Get me error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin cá nhân'));
    }
  }
}

module.exports = UsersController;
