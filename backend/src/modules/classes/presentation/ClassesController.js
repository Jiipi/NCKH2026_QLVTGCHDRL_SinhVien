const ListClassesDto = require('../application/dto/ListClassesDto');
const CreateClassDto = require('../application/dto/CreateClassDto');
const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * ClassesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ClassesController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getAll(req, res) {
    try {
      const dto = ListClassesDto.fromQuery(req.query);
      const result = await this.useCases.list.execute(dto, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách lớp'));
    } catch (error) {
      logError('Get classes error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const classData = await this.useCases.getById.execute(id, req.user, false);
      return sendResponse(res, 200, ApiResponse.success(classData, 'Thông tin lớp'));
    } catch (error) {
      logError('Get class by ID error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin lớp'));
    }
  }

  async create(req, res) {
    try {
      const dto = CreateClassDto.fromRequest(req.body);
      const result = await this.useCases.create.execute(dto, req.user);
      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo lớp thành công'));
    } catch (error) {
      logError('Create class error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không tạo được lớp'));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await this.useCases.update.execute(id, req.body, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật lớp thành công'));
    } catch (error) {
      logError('Update class error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không cập nhật được lớp'));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.useCases.delete.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa lớp thành công'));
    } catch (error) {
      logError('Delete class error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không xóa được lớp'));
    }
  }

  async assignTeacher(req, res) {
    try {
      const { id } = req.params;
      const { teacherId } = req.body;
      
      if (!teacherId) {
        return sendResponse(res, 400, ApiResponse.validationError([{ message: 'teacherId là bắt buộc' }]));
      }
      
      const result = await this.useCases.assignTeacher.execute(id, teacherId, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Gán giảng viên thành công'));
    } catch (error) {
      logError('Assign teacher error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không gán được giảng viên'));
    }
  }

  async getStudents(req, res) {
    try {
      const { id } = req.params;
      const students = await this.useCases.getStudents.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(students, 'Danh sách sinh viên'));
    } catch (error) {
      logError('Get students error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách sinh viên'));
    }
  }

  async getActivities(req, res) {
    try {
      const { id } = req.params;
      const activities = await this.useCases.getActivities.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(activities, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get class activities error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }
}

module.exports = ClassesController;

