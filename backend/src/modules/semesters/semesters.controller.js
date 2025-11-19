/**
 * Semesters Controller
 * Handles HTTP requests for semester management
 */

const SemestersService = require('./semesters.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError } = require('../../core/logger');

class SemestersController {
  /**
   * @route   GET /api/semesters/options
   * @desc    Get semester options for UI dropdowns
   * @access  Private
   */
  static async getSemesterOptions(req, res) {
    try {
      const options = await SemestersService.getSemesterOptions();
      return sendResponse(res, 200, ApiResponse.success(options, 'Semester options'));
    } catch (error) {
      logError('Get semester options error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách học kỳ'));
    }
  }

  /**
   * @route   GET /api/semesters/current
   * @desc    Get current semester info
   * @access  Private
   */
  static async getCurrentSemester(req, res) {
    try {
      const current = SemestersService.getCurrentSemester();
      return sendResponse(res, 200, ApiResponse.success(current, 'Current semester'));
    } catch (error) {
      logError('Get current semester error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin học kỳ hiện tại'));
    }
  }

  /**
   * @route   GET /api/semesters/status/:classId/:semester
   * @desc    Get semester closure status
   * @access  Private
   */
  static async getSemesterStatus(req, res) {
    try {
      const { classId, semester } = req.params;
      const status = SemestersService.getSemesterStatus(classId, semester);
      
      return sendResponse(res, 200, ApiResponse.success(status, 'Semester status'));
    } catch (error) {
      logError('Get semester status error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được trạng thái học kỳ'));
    }
  }

  /**
   * @route   GET /api/semesters/status
   * @desc    Get current semester status (without params)
   * @access  Private
   */
  static async getCurrentSemesterStatus(req, res) {
    try {
      const { prisma } = require('../../infrastructure/prisma/client');
      const SemesterClosure = require('../../services/semesterClosure.service');
      
      // Lấy classId từ query params hoặc từ user context
      let classId = req.query?.classId || null;
      
      // Nếu không có classId từ query, thử lấy từ user context (monitor/student)
      if (!classId) {
        const userId = req.user?.sub;
        if (userId) {
          // Thử lấy từ monitor context
          if (req.classMonitor?.lop_id) {
            classId = req.classMonitor.lop_id;
          } else {
            // Thử lấy từ student record
            const student = await prisma.sinhVien.findFirst({
              where: { nguoi_dung_id: userId },
              select: { lop_id: true }
            });
            if (student?.lop_id) {
              classId = student.lop_id;
            }
          }
        }
      }
      
      // Lấy học kỳ hiện tại
      const current = SemestersService.getCurrentSemester();
      const semesterStr = current ? `${current.semester}-${current.year}` : null;
      
      // Nếu có classId, lấy status từ SemesterClosure
      if (classId && semesterStr) {
        const statusResult = SemesterClosure.getStatus(classId, semesterStr);
        // Format: { semInfo: { semester, year }, state: { state, ... } }
        // Cần chuyển thành: { classId, semester: { semester, year }, state: { state, ... } }
        const status = {
          classId: classId,
          semester: statusResult.semInfo || current,
          state: statusResult.state || {
            state: 'ACTIVE',
            lock_level: null,
            proposed_by: null,
            approved_by: null,
            closed_by: null,
            closed_at: null,
            grace_until: null,
            version: 1,
            snapshot_checksum: null
          }
        };
        return sendResponse(res, 200, ApiResponse.success(status, 'Current semester status'));
      }
      
      // Fallback: trả về format đơn giản nếu không có classId
      const status = {
        classId: null,
        semester: current,
        state: {
          state: 'ACTIVE',
          lock_level: null,
          proposed_by: null,
          approved_by: null,
          closed_by: null,
          closed_at: null,
          grace_until: null,
          version: 1,
          snapshot_checksum: null
        }
      };
      
      return sendResponse(res, 200, ApiResponse.success(status, 'Current semester status'));
    } catch (error) {
      logError('Get current semester status error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được trạng thái học kỳ'));
    }
  }

  /**
   * @route   POST /api/semesters/propose-close
   * @desc    Propose semester closure
   * @access  Private (Admin/Teacher)
   */
  static async proposeClosure(req, res) {
    try {
      const { classId, semester } = req.body;
      const actorId = req.user.sub;

      const state = await SemestersService.proposeClosure(classId, actorId, semester);
      
      return sendResponse(res, 200, ApiResponse.success(state, 'Đề xuất khóa học kỳ thành công'));
    } catch (error) {
      logError('Propose closure error', error);
      
      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi đề xuất khóa học kỳ'));
    }
  }

  /**
   * @route   POST /api/semesters/soft-lock
   * @desc    Soft lock semester with grace period
   * @access  Private (Admin/Teacher)
   */
  static async softLock(req, res) {
    try {
      const { classId, semester, graceHours } = req.body;
      const actorId = req.user.sub;

      const state = await SemestersService.softLock(
        classId, 
        actorId, 
        semester, 
        parseInt(graceHours || 72)
      );
      
      return sendResponse(res, 200, ApiResponse.success(state, 'Khóa mềm học kỳ thành công'));
    } catch (error) {
      logError('Soft lock error', error);
      
      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi khóa mềm học kỳ'));
    }
  }

  /**
   * @route   POST /api/semesters/hard-lock
   * @desc    Hard lock semester (no modifications allowed)
   * @access  Private (Admin)
   */
  static async hardLock(req, res) {
    try {
      const { classId, semester } = req.body;
      const actorId = req.user.sub;

      const state = await SemestersService.hardLock(classId, actorId, semester);
      
      return sendResponse(res, 200, ApiResponse.success(state, 'Khóa cứng học kỳ thành công'));
    } catch (error) {
      logError('Hard lock error', error);
      
      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi khóa cứng học kỳ'));
    }
  }

  /**
   * @route   POST /api/semesters/rollback
   * @desc    Rollback semester closure
   * @access  Private (Admin)
   */
  static async rollback(req, res) {
    try {
      const { classId, semester } = req.body;
      const actorId = req.user.sub;

      const state = await SemestersService.rollback(classId, actorId, semester);
      
      return sendResponse(res, 200, ApiResponse.success(state, 'Mở lại học kỳ thành công'));
    } catch (error) {
      logError('Rollback error', error);
      
      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi mở lại học kỳ'));
    }
  }

  /**
   * @route   GET /api/semesters/classes
   * @desc    Get all classes for semester management
   * @access  Private
   */
  static async getAllClasses(req, res) {
    try {
      const classes = await SemestersService.getAllClasses();
      return sendResponse(res, 200, ApiResponse.success(classes, 'Danh sách lớp'));
    } catch (error) {
      logError('Get classes error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  /**
   * @route   GET /api/semesters/classes/:classId
   * @desc    Get class detail for admin tools
   * @access  Private
   */
  static async getClassDetail(req, res) {
    try {
      const { classId } = req.params;
      const detail = await SemestersService.getClassDetail(classId);
      return sendResponse(res, 200, ApiResponse.success(detail, 'Chi tiết lớp học'));
    } catch (error) {
      logError('Get class detail error', error);
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message || 'Không tìm thấy lớp'));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được chi tiết lớp'));
    }
  }

  /**
   * @route   GET /api/semesters/classes/:classId/students
   * @desc    Get students of a class
   * @access  Private
   */
  static async getClassStudents(req, res) {
    try {
      const { classId } = req.params;
      const students = await SemestersService.getClassStudents(classId);
      return sendResponse(res, 200, ApiResponse.success(students, 'Danh sách sinh viên'));
    } catch (error) {
      logError('Get class students error', error);
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message || 'Không tìm thấy lớp'));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách sinh viên'));
    }
  }

  /**
   * @route   GET /api/semesters/activities/:classId/:semester
   * @desc    Get activities summary for a semester
   * @access  Private
   */
  static async getActivitiesBySemester(req, res) {
    try {
      const { classId, semester } = req.params;
      
      const activities = await SemestersService.getActivitiesBySemester(classId, semester);
      
      return sendResponse(res, 200, ApiResponse.success(activities, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get activities by semester error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }

  /**
   * @route   GET /api/semesters/registrations/:classId/:semester
   * @desc    Get registrations summary for a semester
   * @access  Private
   */
  static async getRegistrationsBySemester(req, res) {
    try {
      const { classId, semester } = req.params;
      
      const registrations = await SemestersService.getRegistrationsBySemester(classId, semester);
      
      return sendResponse(res, 200, ApiResponse.success(registrations, 'Danh sách đăng ký'));
    } catch (error) {
      logError('Get registrations by semester error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách đăng ký'));
    }
  }

  /**
   * @route   POST /api/semesters/create-next
   * @desc    Create next semester automatically
   * @access  Private (Admin)
   */
  static async createNextSemester(req, res) {
    try {
      // Check if user is admin
      const userRole = req.user?.role || req.user?.vai_tro;
      if (!userRole || !['ADMIN', 'QUẢN_TRỊ_VIÊN'].includes(userRole.toUpperCase().replace(/\s/g, '_'))) {
        return sendResponse(res, 403, ApiResponse.error('Không có quyền truy cập'));
      }
      
      const result = await SemestersService.createNextSemester(req.user);
      
      if (result.success) {
        return sendResponse(res, 200, ApiResponse.success(result.data, result.message));
      } else {
        return sendResponse(res, 400, ApiResponse.error(result.message));
      }
    } catch (error) {
      logError('Create next semester error', error);
      return sendResponse(res, 500, ApiResponse.error(error.message || 'Không thể tạo học kỳ mới'));
    }
  }

  /**
   * @route   POST /api/semesters/activate
   * @desc    Activate a semester (locks old semesters, unlocks new)
   * @access  Private (Admin)
   */
  static async activateSemester(req, res) {
    try {
      // Check if user is admin
      const userRole = req.user?.role || req.user?.vai_tro;
      if (!userRole || !['ADMIN', 'QUẢN_TRỊ_VIÊN'].includes(userRole.toUpperCase().replace(/\s/g, '_'))) {
        return sendResponse(res, 403, ApiResponse.error('Không có quyền truy cập'));
      }
      
      const { semester } = req.body;
      
      if (!semester) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu thông tin học kỳ'));
      }
      
      const result = await SemestersService.activateSemester(semester, req.user);
      
      if (result.success) {
        return sendResponse(res, 200, ApiResponse.success(result.data, result.message));
      } else {
        return sendResponse(res, 400, ApiResponse.error(result.message));
      }
    } catch (error) {
      logError('Activate semester error', error);
      return sendResponse(res, 500, ApiResponse.error(error.message || 'Không thể kích hoạt học kỳ'));
    }
  }

  /**
   * TODO: Add more controllers from routes/semesters.route.js:
   * - Batch closure operations
   * - Statistics endpoints
   * - Export functionality
   * - Advanced search and filtering
   */
}

module.exports = SemestersController;
