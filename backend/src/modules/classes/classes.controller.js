/**
 * Classes Controller
 * Handles HTTP requests for class management
 */

const classesService = require('./classes.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError } = require('../../core/logger');

class ClassesController {
  /**
   * @route   GET /api/core/classes
   * @desc    Get all classes
   * @access  Private
   */
  static async getAll(req, res) {
    try {
      const { page, limit, search, khoa } = req.query;
      
      const result = await classesService.list(
        req.user,
        { search, khoa },
        { page: parseInt(page) || 1, limit: parseInt(limit) || 10 }
      );

      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách lớp'));
    } catch (error) {
      logError('Get classes error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  /**
   * @route   GET /api/core/classes/:id
   * @desc    Get class by ID
   * @access  Private
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const classData = await classesService.getById(id, req.user, false);

      if (!classData) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy lớp'));
      }

      return sendResponse(res, 200, ApiResponse.success(classData, 'Thông tin lớp'));
    } catch (error) {
      logError('Get class by ID error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin lớp'));
    }
  }

  /**
   * @route   POST /api/core/classes
   * @desc    Create new class
   * @access  Private (Admin only)
   */
  static async create(req, res) {
    try {
      const classData = req.body;
      const result = await classesService.create(classData, req.user);

      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo lớp thành công'));
    } catch (error) {
      logError('Create class error', error);

      if (error.status === 400) {
        return sendResponse(res, 400, ApiResponse.validationError(error.errors || [{ message: error.message }]));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không tạo được lớp'));
    }
  }

  /**
   * @route   PUT /api/core/classes/:id
   * @desc    Update class
   * @access  Private (Admin)
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await classesService.update(id, updateData, req.user);

      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật lớp thành công'));
    } catch (error) {
      logError('Update class error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không cập nhật được lớp'));
    }
  }

  /**
   * @route   DELETE /api/core/classes/:id
   * @desc    Delete class
   * @access  Private (Admin only)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await classesService.delete(id, req.user);

      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa lớp thành công'));
    } catch (error) {
      logError('Delete class error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không xóa được lớp'));
    }
  }

  /**
   * @route   POST /api/core/classes/:id/assign-teacher
   * @desc    Assign teacher to class
   * @access  Private (Admin only)
   */
  static async assignTeacher(req, res) {
    try {
      const { id } = req.params;
      const { teacherId } = req.body;
      
      if (!teacherId) {
        return sendResponse(res, 400, ApiResponse.validationError([{ message: 'teacherId là bắt buộc' }]));
      }
      
      const result = await classesService.assignTeacher(id, teacherId, req.user);
      
      return sendResponse(res, 200, ApiResponse.success(result, 'Gán giảng viên thành công'));
    } catch (error) {
      logError('Assign teacher error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không gán được giảng viên'));
    }
  }

  /**
   * @route   GET /api/core/classes/:id/students
   * @desc    Get students in class
   * @access  Private
   */
  static async getStudents(req, res) {
    try {
      const { id } = req.params;
      const students = await classesService.getStudents(id, req.user);
      
      return sendResponse(res, 200, ApiResponse.success(students, 'Danh sách sinh viên'));
    } catch (error) {
      logError('Get students error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách sinh viên'));
    }
  }

  /**
   * @route   GET /api/core/classes/:id/activities
   * @desc    Get activities for class
   * @access  Private
   */
  static async getActivities(req, res) {
    try {
      const { id } = req.params;
      const activities = await classesService.getActivities(id, req.user);
      
      return sendResponse(res, 200, ApiResponse.success(activities, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get class activities error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }
}

module.exports = ClassesController;
