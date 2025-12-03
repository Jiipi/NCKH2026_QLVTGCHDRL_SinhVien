const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

/**
 * SemestersController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class SemestersController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getSemesterOptions(req, res) {
    try {
      const options = await this.useCases.getSemesterOptions.execute();
      return sendResponse(res, 200, ApiResponse.success(options, 'Semester options'));
    } catch (error) {
      logError('Get semester options error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách học kỳ'));
    }
  }

  async getCurrentSemester(req, res) {
    try {
      const current = await this.useCases.getCurrentSemester.execute();
      return sendResponse(res, 200, ApiResponse.success(current, 'Current semester'));
    } catch (error) {
      logError('Get current semester error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin học kỳ hiện tại'));
    }
  }

  async getSemesterStatus(req, res) {
    try {
      const { classId, semester } = req.params;
      const status = this.useCases.getSemesterStatus.execute(classId, semester);
      return sendResponse(res, 200, ApiResponse.success(status, 'Semester status'));
    } catch (error) {
      logError('Get semester status error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được trạng thái học kỳ'));
    }
  }

  async getCurrentSemesterStatus(req, res) {
    try {
      const classId = req.query?.classId || null;
      const semester = req.query?.semester || null;
      const userId = req.user?.sub || null;
      const classMonitor = req.classMonitor || null;
      
      const status = await this.useCases.getCurrentSemesterStatus.execute(classId, userId, classMonitor, semester);
      return sendResponse(res, 200, ApiResponse.success(status, 'Current semester status'));
    } catch (error) {
      logError('Get current semester status error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được trạng thái học kỳ'));
    }
  }

  async proposeClosure(req, res) {
    try {
      const { classId, semester } = req.body;
      const actorId = req.user.sub;
      const state = await this.useCases.proposeClosure.execute(classId, actorId, semester);
      return sendResponse(res, 200, ApiResponse.success(state, 'Đề xuất khóa học kỳ thành công'));
    } catch (error) {
      logError('Propose closure error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi đề xuất khóa học kỳ'));
    }
  }

  async softLock(req, res) {
    try {
      const { classId, semester, graceHours } = req.body;
      const actorId = req.user.sub;
      const state = await this.useCases.softLock.execute(
        classId, 
        actorId, 
        semester, 
        parseInt(graceHours || 72)
      );
      return sendResponse(res, 200, ApiResponse.success(state, 'Khóa mềm học kỳ thành công'));
    } catch (error) {
      logError('Soft lock error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi khóa mềm học kỳ'));
    }
  }

  async hardLock(req, res) {
    try {
      const { classId, semester } = req.body;
      const actorId = req.user.sub;
      const state = await this.useCases.hardLock.execute(classId, actorId, semester);
      return sendResponse(res, 200, ApiResponse.success(state, 'Khóa cứng học kỳ thành công'));
    } catch (error) {
      logError('Hard lock error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi khóa cứng học kỳ'));
    }
  }

  async rollback(req, res) {
    try {
      const { classId, semester } = req.body;
      const actorId = req.user.sub;
      const state = await this.useCases.rollback.execute(classId, actorId, semester);
      return sendResponse(res, 200, ApiResponse.success(state, 'Mở lại học kỳ thành công'));
    } catch (error) {
      logError('Rollback error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi mở lại học kỳ'));
    }
  }

  async getAllClasses(req, res) {
    try {
      const classes = await this.useCases.getAllClasses.execute();
      return sendResponse(res, 200, ApiResponse.success(classes, 'Danh sách lớp'));
    } catch (error) {
      logError('Get classes error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  async getClassDetail(req, res) {
    try {
      const { classId } = req.params;
      const detail = await this.useCases.getClassDetail.execute(classId);
      return sendResponse(res, 200, ApiResponse.success(detail, 'Chi tiết lớp học'));
    } catch (error) {
      logError('Get class detail error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được chi tiết lớp'));
    }
  }

  async getClassStudents(req, res) {
    try {
      const { classId } = req.params;
      const students = await this.useCases.getClassStudents.execute(classId);
      return sendResponse(res, 200, ApiResponse.success(students, 'Danh sách sinh viên'));
    } catch (error) {
      logError('Get class students error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách sinh viên'));
    }
  }

  async getActivitiesBySemester(req, res) {
    try {
      const { classId, semester } = req.params;
      const activities = await this.useCases.getActivitiesBySemester.execute(classId, semester);
      return sendResponse(res, 200, ApiResponse.success(activities, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get activities by semester error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }

  async getRegistrationsBySemester(req, res) {
    try {
      const { classId, semester } = req.params;
      const registrations = await this.useCases.getRegistrationsBySemester.execute(classId, semester);
      return sendResponse(res, 200, ApiResponse.success(registrations, 'Danh sách đăng ký'));
    } catch (error) {
      logError('Get registrations by semester error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách đăng ký'));
    }
  }

  async createNextSemester(req, res) {
    try {
      const userRole = req.user?.role || req.user?.vai_tro;
      if (!userRole || !['ADMIN', 'QUẢN_TRỊ_VIÊN'].includes(userRole.toUpperCase().replace(/\s/g, '_'))) {
        return sendResponse(res, 403, ApiResponse.error('Không có quyền truy cập'));
      }
      
      const result = await this.useCases.createNextSemester.execute(req.user);
      
      if (result.success) {
        return sendResponse(res, 200, ApiResponse.success(result.data, result.message));
      } else {
        return sendResponse(res, 400, ApiResponse.error(result.message));
      }
    } catch (error) {
      logError('Create next semester error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error(error.message || 'Không thể tạo học kỳ mới'));
    }
  }

  async activateSemester(req, res) {
    try {
      const userRole = req.user?.role || req.user?.vai_tro;
      if (!userRole || !['ADMIN', 'QUẢN_TRỊ_VIÊN'].includes(userRole.toUpperCase().replace(/\s/g, '_'))) {
        return sendResponse(res, 403, ApiResponse.error('Không có quyền truy cập'));
      }
      
      const { semester } = req.body;
      
      if (!semester) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu thông tin học kỳ'));
      }
      
      const result = await this.useCases.activateSemester.execute(semester, req.user);
      
      if (result.success) {
        return sendResponse(res, 200, ApiResponse.success(result.data, result.message));
      } else {
        return sendResponse(res, 400, ApiResponse.error(result.message));
      }
    } catch (error) {
      logError('Activate semester error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error(error.message || 'Không thể kích hoạt học kỳ'));
    }
  }
}

module.exports = SemestersController;

