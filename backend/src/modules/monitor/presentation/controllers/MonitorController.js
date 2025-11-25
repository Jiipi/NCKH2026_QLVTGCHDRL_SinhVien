const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

/**
 * MonitorController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class MonitorController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getClassStudents(req, res) {
    try {
      const classId = req.classMonitor?.lop_id;
      const { semester } = req.query;
      
      const students = await this.useCases.getClassStudents.execute(classId, semester);
      return sendResponse(res, 200, ApiResponse.success(students, 'Danh sách sinh viên lớp'));
    } catch (error) {
      logError('Get class students error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách sinh viên'));
    }
  }

  async getPendingRegistrations(req, res) {
    try {
      const classId = req.classMonitor?.lop_id;
      const { status, semester } = req.query;
      
      const registrations = await this.useCases.getPendingRegistrations.execute(classId, status, semester);
      
      const base = `${req.protocol}://${req.get('host')}`;
      const normalized = registrations.map(r => {
        try {
          const imgs = Array.isArray(r?.hoat_dong?.hinh_anh) ? r.hoat_dong.hinh_anh : [];
          const abs = imgs.map(u => (typeof u === 'string' && u.startsWith('/uploads/')) ? (base + u) : u).filter(Boolean);
          let approvedByRole = null; let rejectedByRole = null; let approvedByUser = null; let rejectedByUser = null;
          if (typeof r?.ghi_chu === 'string') {
            const ap = /APPROVED_BY:([A-Z_]+)\|USER:([a-f0-9\-]+)/i.exec(r.ghi_chu);
            const rj = /REJECTED_BY:([A-Z_]+)\|USER:([a-f0-9\-]+)/i.exec(r.ghi_chu);
            if (ap) { approvedByRole = ap[1]; approvedByUser = ap[2]; }
            if (rj) { rejectedByRole = rj[1]; rejectedByUser = rj[2]; }
          }
          return { 
            ...r, 
            hoat_dong: { ...r.hoat_dong, hinh_anh: abs },
            approvedByRole,
            rejectedByRole,
            approvedByUser,
            rejectedByUser
          };
        } catch (_) { 
          return r; 
        }
      });
      
      return sendResponse(res, 200, ApiResponse.success(
        normalized,
        `Tìm thấy ${registrations.length} đăng ký`
      ));
    } catch (error) {
      logError('Get pending registrations error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách đăng ký'));
    }
  }

  async getPendingRegistrationsCount(req, res) {
    try {
      const classId = req.classMonitor?.lop_id;
      const count = await this.useCases.getPendingRegistrationsCount.execute(classId);
      return sendResponse(res, 200, ApiResponse.success({ count }, 'Số đăng ký chờ duyệt'));
    } catch (error) {
      logError('Get pending registrations count error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy số lượng đăng ký chờ duyệt'));
    }
  }

  async approveRegistration(req, res) {
    try {
      const { registrationId } = req.params;
      const userId = req.user.sub;
      const userRole = req.user.role;
      
      await this.useCases.approveRegistration.execute(registrationId, userId, userRole);
      return sendResponse(res, 200, ApiResponse.success(null, 'Phê duyệt đăng ký thành công'));
    } catch (error) {
      logError('Approve registration error', error);
      if (error instanceof AppError) {
        if (error.statusCode === 404) {
          return sendResponse(res, 404, ApiResponse.notFound(error.message));
        }
        if (error.statusCode === 423) {
          return sendResponse(res, 423, ApiResponse.error(error.message, error.details));
        }
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi phê duyệt đăng ký'));
    }
  }

  async rejectRegistration(req, res) {
    try {
      const { registrationId } = req.params;
      const { reason } = req.body;
      const userId = req.user.sub;
      const userRole = req.user.role;
      
      await this.useCases.rejectRegistration.execute(registrationId, userId, userRole, reason);
      return sendResponse(res, 200, ApiResponse.success(null, 'Từ chối đăng ký thành công'));
    } catch (error) {
      logError('Reject registration error', error);
      if (error instanceof AppError) {
        if (error.statusCode === 404) {
          return sendResponse(res, 404, ApiResponse.notFound(error.message));
        }
        if (error.statusCode === 423) {
          return sendResponse(res, 423, ApiResponse.error(error.message, error.details));
        }
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi từ chối đăng ký'));
    }
  }

  async getMonitorDashboard(req, res) {
    try {
      const classId = req.classMonitor?.lop_id;
      const className = req.classMonitor?.lop?.ten_lop;
      const { semester } = req.query;
      
      if (!classId) {
        return sendResponse(res, 403, ApiResponse.error('Bạn chưa được gán vào lớp nào'));
      }
      
      const dashboard = await this.useCases.getMonitorDashboard.execute(classId, className, semester);
      return sendResponse(res, 200, ApiResponse.success(dashboard));
    } catch (error) {
      logError('Get monitor dashboard error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin dashboard'));
    }
  }

  async getClassReports(req, res) {
    try {
      const classId = req.classMonitor?.lop_id;
      const { semester, timeRange } = req.query;

      if (!classId) {
        return sendResponse(res, 403, ApiResponse.error('Bạn chưa được gán vào lớp nào'));
      }

      const report = await this.useCases.getClassReports.execute(classId, { semester, timeRange });
      return sendResponse(res, 200, ApiResponse.success(report));
    } catch (error) {
      logError('Get class reports error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy dữ liệu báo cáo lớp'));
    }
  }
}

module.exports = MonitorController;

