const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

/**
 * TeachersController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class TeachersController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getDashboard(req, res) {
    try {
      const { semester, classId } = req.query;
      const dashboard = await this.useCases.getDashboard.execute(req.user, semester, classId);
      return sendResponse(res, 200, ApiResponse.success(dashboard));
    } catch (error) {
      logError('Get teacher dashboard error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy dashboard'));
    }
  }

  async getClasses(req, res) {
    try {
      const classes = await this.useCases.getClasses.execute(req.user);
      return sendResponse(res, 200, ApiResponse.success(classes));
    } catch (error) {
      logError('Get teacher classes error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách lớp'));
    }
  }

  async getStudents(req, res) {
    try {
      const { class: className, classId, classFilter, search, semester } = req.query;
      const filters = {};
      if (classId) filters.classId = String(classId);
      else if (classFilter) filters.classId = String(classFilter);
      else if (className) filters.class = String(className);
      if (search) filters.search = String(search);
      if (semester) filters.semester = String(semester);

      const students = await this.useCases.getStudents.execute(req.user, filters);
      return sendResponse(res, 200, ApiResponse.success(students));
    } catch (error) {
      logError('Get teacher students error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách sinh viên'));
    }
  }

  async getPendingActivities(req, res) {
    try {
      const { page, limit, semester } = req.query;
      const result = await this.useCases.getPendingActivities.execute(req.user, {
        page,
        limit,
        semester
      });
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Get pending activities error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy hoạt động chờ duyệt'));
    }
  }

  async getActivityHistory(req, res) {
    try {
      const { page, limit, status, semester } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (semester) filters.semester = String(semester);

      const result = await this.useCases.getActivityHistory.execute(req.user, filters, { page, limit });
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Get activity history error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử hoạt động'));
    }
  }

  async approveActivity(req, res) {
    try {
      const activity = await this.useCases.approveActivity.execute(req.params.id, req.user);
      return sendResponse(res, 200, ApiResponse.success(activity, 'Đã duyệt hoạt động thành công'));
    } catch (error) {
      logError('Approve activity error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt hoạt động'));
    }
  }

  async rejectActivity(req, res) {
    try {
      const { reason } = req.body;
      const activity = await this.useCases.rejectActivity.execute(req.params.id, reason, req.user);
      return sendResponse(res, 200, ApiResponse.success(activity, 'Đã từ chối hoạt động'));
    } catch (error) {
      logError('Reject activity error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi từ chối hoạt động'));
    }
  }

  async getAllRegistrations(req, res) {
    try {
      const { status, semester, classId } = req.query;
      const result = await this.useCases.getAllRegistrations.execute(req.user, {
        status,
        semester,
        classId
      });
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Get all registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách đăng ký'));
    }
  }

  async getPendingRegistrations(req, res) {
    try {
      const { page, limit, classId, semester, status } = req.query;
      const result = await this.useCases.getPendingRegistrations.execute(req.user, {
        page,
        limit,
        classId,
        semester,
        status
      });
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Get pending registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy đăng ký chờ duyệt'));
    }
  }

  async approveRegistration(req, res) {
    try {
      const registration = await this.useCases.approveRegistration.execute(req.params.id, req.user);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Đã duyệt đăng ký thành công'));
    } catch (error) {
      logError('Approve registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt đăng ký'));
    }
  }

  async rejectRegistration(req, res) {
    try {
      const { reason } = req.body;
      const registration = await this.useCases.rejectRegistration.execute(req.params.id, reason, req.user);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Đã từ chối đăng ký'));
    } catch (error) {
      logError('Reject registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi từ chối đăng ký'));
    }
  }

  async bulkApproveRegistrations(req, res) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return sendResponse(res, 400, ApiResponse.error('ids phải là array'));
      }
      const result = await this.useCases.bulkApproveRegistrations.execute(ids, req.user);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Bulk approve registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt hàng loạt đăng ký'));
    }
  }

  async getClassStatistics(req, res) {
    try {
      const { semesterId } = req.query;
      const stats = await this.useCases.getClassStatistics.execute(
        req.params.className,
        semesterId,
        req.user
      );
      return sendResponse(res, 200, ApiResponse.success(stats));
    } catch (error) {
      logError('Get class statistics error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê lớp'));
    }
  }

  async getClassStatisticsById(req, res) {
    try {
      const { id } = req.params;
      const { semesterId } = req.query;
      const { prisma } = require('../../../../data/infrastructure/prisma/client');

      const lop = await prisma.lop.findUnique({ where: { id: String(id) }, select: { ten_lop: true } });
      if (!lop) {
        return sendResponse(res, 200, ApiResponse.success({
          totalStudents: 0,
          totalActivities: 0,
          approvedActivities: 0,
          totalRegistrations: 0,
          approvedRegistrations: 0
        }));
      }

      const stats = await this.useCases.getClassStatistics.execute(lop.ten_lop, semesterId, req.user);
      return sendResponse(res, 200, ApiResponse.success(stats));
    } catch (error) {
      logError('Get class statistics by ID error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê lớp'));
    }
  }

  async assignClassMonitor(req, res) {
    try {
      const { id } = req.params;
      const { sinh_vien_id } = req.body || {};

      if (!sinh_vien_id) {
        return sendResponse(res, 400, ApiResponse.error('Thiếu sinh_vien_id'));
      }

      const result = await this.useCases.assignClassMonitor.execute(String(id), String(sinh_vien_id), req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Gán lớp trưởng thành công'));
    } catch (error) {
      logError('Assign class monitor error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi gán lớp trưởng'));
    }
  }

  async createStudent(req, res) {
    try {
      const result = await this.useCases.createStudent.execute(req.user, req.body);
      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo sinh viên thành công'));
    } catch (error) {
      logError('Create student error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi tạo sinh viên'));
    }
  }

  async exportStudents(req, res) {
    try {
      const format = String(req.query.format || 'xlsx').toLowerCase();
      const students = await this.useCases.exportStudents.execute(req.user);

      const rows = students.map(s => ({
        MSSV: s.mssv,
        'Họ và tên': s.ho_ten,
        Email: s.email,
        Lớp: s.lop,
        Khoa: s.khoa,
        'Niên khóa': s.nien_khoa,
        'Số điện thoại': s.sdt || ''
      }));

      const dateStr = new Date().toISOString().slice(0,10);
      if (format === 'csv') {
        const headers = Object.keys(rows[0] || {
          MSSV: '', 'Họ và tên': '', Email: '', Lớp: '', Khoa: '', 'Niên khóa': '', 'Số điện thoại': ''
        });
        const escape = (v) => {
          const s = v == null ? '' : String(v);
          if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
          return s;
        };
        const lines = [headers.join(',')].concat(rows.map(r => headers.map(h => escape(r[h])).join(',')));
        const csv = '\uFEFF' + lines.join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="danh_sach_sinh_vien_${dateStr}.csv"`);
        return res.status(200).send(csv);
      }

      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet(rows, { cellDates: true, dateNF: 'yyyy-mm-dd' });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SinhVien');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer', bookSST: true });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="danh_sach_sinh_vien_${dateStr}.xlsx"`);
      return res.status(200).send(buffer);
    } catch (error) {
      logError('Export students error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi export sinh viên'));
    }
  }

  async getReportStatistics(req, res) {
    try {
      const { semesterId, semester } = req.query;
      const sem = semesterId || semester || null;
      
      const stats = await this.useCases.getReportStatistics.execute(req.user, {
        semesterId: sem
      });
      
      return sendResponse(res, 200, ApiResponse.success(stats));
    } catch (error) {
      logError('Get report statistics error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê báo cáo'));
    }
  }
}

module.exports = TeachersController;

