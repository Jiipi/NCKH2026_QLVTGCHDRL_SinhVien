/**
 * Activities Controller
 * Handles HTTP requests for activity management
 */

const activitiesService = require('./activities.service');
const registrationsService = require('../registrations/registrations.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError } = require('../../core/logger');

class ActivitiesController {
  /**
   * @route   GET /api/core/activities
   * @desc    Get all activities (with scope filtering)
   * @access  Private
   */
  static async getAll(req, res) {
    try {
      const { page, limit, search, status, type, semester, semesterValue, sort, order } = req.query;
      
      // Support both 'semester' (legacy) and 'semesterValue' (new) for backward compatibility
      const semesterParam = semesterValue || semester;
      
      // Pass scope from middleware to service
      const filters = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        status,
        type,
        semester: semesterParam,
        sort,
        order,
        // Apply scope from classScope middleware
        scope: req.scope,
      };

      const result = await activitiesService.list(filters, req.user);

      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get activities error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }

  /**
   * @route   GET /api/core/activities/:id
   * @desc    Get activity by ID
   * @access  Private
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      // Pass scope from middleware to service (for class-based access control)
      const scope = req.scope || {};
      const activity = await activitiesService.getById(id, scope, req.user);

      if (!activity) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
      }

      return sendResponse(res, 200, ApiResponse.success(activity, 'Chi tiết hoạt động'));
    } catch (error) {
      logError('Get activity by ID error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin hoạt động'));
    }
  }

  /**
   * @route   GET /api/core/activities/:id/details
   * @desc    Get activity details with registrations
   * @access  Private
   */
  static async getDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await activitiesService.getDetails(id, req.user);

      return sendResponse(res, 200, ApiResponse.success(result, 'Chi tiết hoạt động'));
    } catch (error) {
      logError('Get activity details error', error);
      
      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }
      
      return sendResponse(res, 500, ApiResponse.error('Không lấy được chi tiết hoạt động'));
    }
  }

  /**
   * @route   POST /api/core/activities
   * @desc    Create new activity
   * @access  Private
   */
  static async create(req, res) {
    try {
      const activityData = req.body;
      
      const result = await activitiesService.create(activityData, req.user);

      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo hoạt động thành công'));
    } catch (error) {
      logError('Create activity error', error);

      if (error.status === 400) {
        return sendResponse(res, 400, ApiResponse.validationError(error.errors || [{ message: error.message }]));
      }

      if (error.status === 423) {
        return sendResponse(res, 423, ApiResponse.error(error.message, error.details));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không tạo được hoạt động'));
    }
  }

  /**
   * @route   PUT /api/core/activities/:id
   * @desc    Update activity
   * @access  Private
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const scope = {}; // Can be enhanced later
      
      const result = await activitiesService.update(id, updateData, req.user, scope);

      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật hoạt động thành công'));
    } catch (error) {
      logError('Update activity error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }

      if (error.status === 423) {
        return sendResponse(res, 423, ApiResponse.error(error.message, error.details));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không cập nhật được hoạt động'));
    }
  }

  /**
   * @route   DELETE /api/core/activities/:id
   * @desc    Delete activity
   * @access  Private (Admin/Creator)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const scope = {}; // Can be enhanced later
      
      await activitiesService.delete(id, req.user, scope);

      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa hoạt động thành công'));
    } catch (error) {
      logError('Delete activity error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không xóa được hoạt động'));
    }
  }

  /**
   * @route   POST /api/core/activities/:id/approve
   * @desc    Approve activity
   * @access  Private (Admin/Teacher)
   */
  static async approve(req, res) {
    try {
      const { id } = req.params;
      const result = await activitiesService.approve(id, req.user);

      return sendResponse(res, 200, ApiResponse.success(result, 'Duyệt hoạt động thành công'));
    } catch (error) {
      logError('Approve activity error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không duyệt được hoạt động'));
    }
  }

  /**
   * @route   POST /api/core/activities/:id/reject
   * @desc    Reject activity
   * @access  Private (Admin/Teacher)
   */
  static async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const result = await activitiesService.reject(id, reason, req.user);

      return sendResponse(res, 200, ApiResponse.success(result, 'Từ chối hoạt động thành công'));
    } catch (error) {
      logError('Reject activity error', error);

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status === 403) {
        return sendResponse(res, 403, ApiResponse.error(error.message));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không từ chối được hoạt động'));
    }
  }

  /**
   * @route   POST /api/core/activities/:id/register
   * @desc    Register for activity
   * @access  Private (Student)
   */
  static async register(req, res) {
    try {
      const { id } = req.params;
      const result = await registrationsService.register(id, req.user);

      return sendResponse(res, 201, ApiResponse.success(result, 'Đăng ký hoạt động thành công'));
    } catch (error) {
      logError('Register activity error', error);

      if (error.status === 400) {
        return sendResponse(res, 400, ApiResponse.error(error.message));
      }

      if (error.status === 404) {
        return sendResponse(res, 404, ApiResponse.notFound(error.message));
      }

      if (error.status === 423) {
        return sendResponse(res, 423, ApiResponse.error(error.message, error.details));
      }

      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không đăng ký được hoạt động'));
    }
  }

  /**
   * @route   POST /api/core/activities/:id/cancel
   * @desc    Cancel activity registration
   * @access  Private (Student)
   */
  static async cancelRegistration(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Find registration by activity ID and user ID
      const { prisma } = require('../../infrastructure/prisma/client');
      const { normalizeRole } = require('../../core/utils/roleHelper');
      
      // Get student ID from user ID
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: user.sub },
        select: { id: true }
      });
      
      if (!student) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông tin sinh viên'));
      }

      // Find registration
      const registration = await prisma.dangKyHoatDong.findFirst({
        where: {
          hd_id: id,
          sv_id: student.id
        }
      });

      if (!registration) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy đăng ký'));
      }

      // Use registrations service to cancel
      const result = await registrationsService.cancel(registration.id, user);
      
      return sendResponse(res, 200, ApiResponse.success(result, 'Hủy đăng ký thành công'));
    } catch (error) {
      logError('Cancel registration error', error);
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Không hủy được đăng ký';
      return sendResponse(res, statusCode, ApiResponse.error(message));
    }
  }

  /**
   * @route   GET /api/core/activities/:id/qr-data
   * @desc    Get QR data for activity
   * @access  Private
   */
  static async getQRData(req, res) {
    try {
      const { id } = req.params;
      const activity = await activitiesService.getById(id, req.user);

      if (!activity) {
        return sendResponse(res, 404, ApiResponse.error('Hoạt động không tồn tại'));
      }

      // Get QR token from activity
      const qrToken = activity.qr || activity.qr_token;
      
      if (!qrToken) {
        return sendResponse(res, 404, ApiResponse.error('Hoạt động chưa có mã QR'));
      }

      // Generate QR JSON data
      const qrData = {
        activity_id: activity.id,
        activity_name: activity.ten_hd,
        qr_token: qrToken,
        qr_json: JSON.stringify({
          activityId: activity.id,
          token: qrToken,
          timestamp: new Date().toISOString()
        })
      };

      return sendResponse(res, 200, ApiResponse.success(qrData, 'Mã QR hoạt động'));
    } catch (error) {
      logError('Get QR data error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được mã QR'));
    }
  }

  /**
   * @route   POST /api/core/activities/:id/attendance/scan
   * @desc    Student self check-in via QR scan (creates DiemDanh)
   * @access  Private (Student)
   */
  static async scanAttendance(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.body || {};

      if (!token) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu mã QR'));
      }

      // Ensure activity exists and is accessible
      const activity = await activitiesService.getById(id, req.user);
      if (!activity) {
        return sendResponse(res, 404, ApiResponse.error('Hoạt động không tồn tại'));
      }

      // Validate QR token
      const serverToken = activity.qr || activity.qr_token;
      if (!serverToken || serverToken !== token) {
        return sendResponse(res, 400, ApiResponse.error('Mã QR không hợp lệ hoặc đã hết hạn'));
      }

      const { prisma } = require('../../infrastructure/prisma/client');

      // Get current student by user
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: req.user.sub },
        select: { id: true, lop_id: true }
      });

      if (!student) {
        return sendResponse(res, 403, ApiResponse.error('Chỉ sinh viên mới có thể điểm danh bằng QR'));
      }

      // Check approved registration exists
      const registration = await prisma.dangKyHoatDong.findUnique({
        where: {
          sv_id_hd_id: { sv_id: student.id, hd_id: String(id) }
        },
        select: { id: true, trang_thai_dk: true }
      });

      if (!registration) {
        return sendResponse(res, 400, ApiResponse.error('Bạn chưa đăng ký hoạt động này'));
      }

      if (registration.trang_thai_dk !== 'da_duyet') {
        return sendResponse(res, 400, ApiResponse.error('Đăng ký chưa được duyệt, không thể điểm danh'));
      }

      // Prevent duplicate attendance
      const existed = await prisma.diemDanh.findUnique({
        where: {
          sv_id_hd_id: { sv_id: student.id, hd_id: String(id) }
        }
      });
      if (existed) {
        // Return conflict to indicate already checked in
        return sendResponse(
          res,
          409,
          ApiResponse.error('Bạn đã điểm danh hoạt động này trước đó', 409, { code: 'ALREADY_CHECKED_IN', attendanceId: existed.id, activityId: activity.id })
        );
      }

      // Create attendance record
      const created = await prisma.diemDanh.create({
        data: {
          nguoi_diem_danh_id: req.user.sub,
          sv_id: student.id,
          hd_id: String(id),
          phuong_thuc: 'qr',
          trang_thai_tham_gia: 'co_mat',
          xac_nhan_tham_gia: true
        }
      });

      // Update registration status to 'da_tham_gia' if currently approved
      try {
        if (registration.trang_thai_dk === 'da_duyet') {
          await prisma.dangKyHoatDong.update({
            where: { sv_id_hd_id: { sv_id: student.id, hd_id: String(id) } },
            data: { trang_thai_dk: 'da_tham_gia' }
          });
        }
      } catch (_) {
        // Non-fatal: attendance succeeded even if status update failed
      }

      return sendResponse(res, 201, ApiResponse.success({
        attendanceId: created.id,
        activityId: activity.id,
        activityName: activity.ten_hd,
        timestamp: created.tg_diem_danh,
        sessionName: 'Mặc định'
      }, 'Điểm danh thành công'));
    } catch (error) {
      logError('QR scan attendance error', error);
      if (error.status) {
        return sendResponse(res, error.status, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể điểm danh'));
    }
  }
}

module.exports = ActivitiesController;
