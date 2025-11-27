const GetUsersDto = require('../../business/dto/GetUsersDto');
const CreateUserDto = require('../../business/dto/CreateUserDto');
const UpdateUserDto = require('../../business/dto/UpdateUserDto');
const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');
const SessionTrackingService = require('../../../../business/services/session-tracking.service');

/**
 * AdminUsersController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class AdminUsersController {
  constructor(
    getUsersUseCase,
    getUserByIdUseCase,
    createUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    exportUsersUseCase
  ) {
    this.getUsersUseCase = getUsersUseCase;
    this.getUserByIdUseCase = getUserByIdUseCase;
    this.createUserUseCase = createUserUseCase;
    this.updateUserUseCase = updateUserUseCase;
    this.deleteUserUseCase = deleteUserUseCase;
    this.exportUsersUseCase = exportUsersUseCase;
  }

  /**
   * Get user statistics (counts by role, status)
   */
  async getStats(req, res) {
    try {
      const { prisma } = require('../../../../data/infrastructure/prisma/client');
      
      // Count by role
      const roleCounts = await prisma.nguoiDung.groupBy({
        by: ['vai_tro_id'],
        _count: { id: true }
      });

      // Get role names
      const roles = await prisma.vaiTro.findMany();
      const roleMap = Object.fromEntries(roles.map(r => [r.id, r.ten_vt]));

      // Normalize role name helper (remove diacritics, lowercase, remove special chars)
      const normalizeRoleName = (name = '') =>
        String(name)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');

      // Calculate counts
      let adminCount = 0, teacherCount = 0, classMonitorCount = 0, studentCount = 0;
      roleCounts.forEach(rc => {
        const roleName = roleMap[rc.vai_tro_id] || '';
        const normalized = normalizeRoleName(roleName);
        
        // Match role names using normalized comparison
        if (normalized.includes('admin') || normalized.includes('quantri')) {
          adminCount += rc._count.id;
        } else if (
          normalized.includes('giangvien') ||
          normalized.includes('giaovien') ||
          normalized.includes('teacher')
        ) {
          teacherCount += rc._count.id;
        } else if (
          normalized.includes('loptruong') ||
          normalized.includes('loptp') ||
          normalized.includes('classmonitor')
        ) {
          classMonitorCount += rc._count.id;
        } else if (
          normalized.includes('sinhvien') ||
          normalized.includes('sv') ||
          normalized.includes('student')
        ) {
          studentCount += rc._count.id;
        }
      });

      // Count by status
      const totalUsers = await prisma.nguoiDung.count();
      const lockedCount = await prisma.nguoiDung.count({ where: { trang_thai: 'khoa' } });
      
      // Debug: Log để kiểm tra
      console.log('[AdminUsersController.getStats] Total users:', totalUsers);
      console.log('[AdminUsersController.getStats] Locked users:', lockedCount);
      console.log('[AdminUsersController.getStats] Role counts:', { adminCount, teacherCount, classMonitorCount, studentCount });

      return sendResponse(res, 200, ApiResponse.success({
        total: totalUsers,
        locked: lockedCount,
        roleCounts: { adminCount, teacherCount, classMonitorCount, studentCount }
      }, 'Lấy thống kê thành công'));
    } catch (error) {
      logError('Error getting user stats', { error: error.message });
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy thống kê'));
    }
  }

  async getUsers(req, res) {
    try {
      const dto = GetUsersDto.fromQuery(req.query);
      
      // Xử lý filter theo trạng thái session
      if (dto.status === 'hoat_dong') {
        // Filter user đang online (có session active trong 5 phút)
        const activeData = await SessionTrackingService.getActiveUsers(5);
        dto.userIds = activeData.userIds || [];
        console.log('[AdminUsersController.getUsers] status=hoat_dong, activeUserIds:', dto.userIds.length);
        // Nếu không có ai online thì trả về rỗng
        if (dto.userIds.length === 0) {
          console.log('[AdminUsersController.getUsers] No active users, returning empty list');
          return sendResponse(res, 200, ApiResponse.success({
            users: [],
            pagination: { page: 1, limit: dto.limit || 20, total: 0, totalPages: 0 }
          }, 'Không có người dùng đang online'));
        }
      } else if (dto.status === 'khong_hoat_dong') {
        // Filter user offline (không có session active và không bị khóa)
        const activeData = await SessionTrackingService.getActiveUsers(5);
        dto.excludeUserIds = activeData.userIds || [];
        dto.excludeStatus = 'khoa'; // Loại bỏ user bị khóa
        console.log('[AdminUsersController.getUsers] status=khong_hoat_dong, excludeUserIds:', dto.excludeUserIds.length);
      } else if (dto.status === 'khoa') {
        console.log('[AdminUsersController.getUsers] status=khoa, filtering locked accounts');
      }
      // status === 'khoa' được xử lý trong UseCase bình thường
      
      const result = await this.getUsersUseCase.execute(dto);
      return sendResponse(res, 200, ApiResponse.success(result, 'Lấy danh sách người dùng thành công'));
    } catch (error) {
      logError('Error fetching users', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách người dùng'));
    }
  }

  /**
   * Get online users (with active sessions)
   */
  async getOnlineUsers(req, res) {
    try {
      const minutesThreshold = parseInt(req.query.minutes) || 5;
      const activeData = await SessionTrackingService.getActiveUsers(minutesThreshold);
      
      if (!activeData.userIds || activeData.userIds.length === 0) {
        return sendResponse(res, 200, ApiResponse.success({
          users: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }, 'Không có người dùng đang online'));
      }
      
      // Fetch users với filter theo IDs
      const dto = GetUsersDto.fromQuery({ 
        page: req.query.page || 1, 
        limit: req.query.limit || 100 
      });
      dto.userIds = activeData.userIds;
      
      const result = await this.getUsersUseCase.execute(dto);
      return sendResponse(res, 200, ApiResponse.success(result, 'Lấy danh sách người dùng online thành công'));
    } catch (error) {
      logError('Error fetching online users', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách người dùng online'));
    }
  }

  async getUserById(req, res) {
    try {
      const user = await this.getUserByIdUseCase.execute(req.params.id);
      return sendResponse(res, 200, ApiResponse.success(user, 'Lấy thông tin người dùng thành công'));
    } catch (error) {
      logError('Error fetching user details', { error: error.message, adminId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi lấy thông tin người dùng'));
    }
  }

  async createUser(req, res) {
    try {
      const dto = CreateUserDto.fromRequest(req.body);
      const adminId = req.user?.sub || req.user?.id;
      const result = await this.createUserUseCase.execute(dto, adminId);
      
      // Tạo thông báo thành công chi tiết
      const roleName = dto.role === 'Admin' ? 'Quản trị viên' :
                      dto.role === 'Giảng viên' ? 'Giảng viên' :
                      dto.role === 'Lớp trưởng' ? 'Lớp trưởng' : 'Sinh viên';
      const successMessage = `Đã tạo tài khoản ${roleName} "${dto.hoten}" (${dto.maso}) thành công`;
      
      return sendResponse(res, 201, ApiResponse.success(result, successMessage));
    } catch (error) {
      logError('Error creating user', { error: error.message, userId: req.user?.id, body: req.body });
      const status = error instanceof AppError ? error.statusCode : 500;
      
      // Cải thiện thông báo lỗi
      let errorMessage = error.message || 'Lỗi tạo người dùng';
      if (error instanceof AppError && error.statusCode === 409) {
        errorMessage = error.message || 'Tài khoản đã tồn tại trong hệ thống';
      } else if (error instanceof AppError && error.statusCode === 400) {
        errorMessage = error.message || 'Dữ liệu không hợp lệ';
      }
      
      return sendResponse(res, status, ApiResponse.error(errorMessage, error.details));
    }
  }

  async updateUser(req, res) {
    try {
      const dto = UpdateUserDto.fromRequest(req.body);
      const adminId = req.user?.sub || req.user?.id;
      const result = await this.updateUserUseCase.execute(req.params.id, dto, adminId);
      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật người dùng thành công'));
    } catch (error) {
      logError('Error updating user', { error: error.message, userId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi cập nhật người dùng', error.details));
    }
  }

  async deleteUser(req, res) {
    try {
      const adminId = req.user?.sub || req.user?.id;
      await this.deleteUserUseCase.execute(req.params.id, adminId);
      return sendResponse(res, 200, ApiResponse.success(null, 'Đã xóa người dùng và toàn bộ dữ liệu liên quan khỏi hệ thống'));
    } catch (error) {
      logError('Error deleting user completely', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi xóa người dùng'));
    }
  }

  async exportUsers(req, res) {
    try {
      const dto = GetUsersDto.fromQuery(req.query);
      const csv = await this.exportUsersUseCase.execute(dto);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      return res.status(200).send(csv);
    } catch (error) {
      logError('Error export users', { error: error.message });
      return sendResponse(res, 500, ApiResponse.error('Lỗi xuất người dùng'));
    }
  }

  /**
   * Lock user account
   * @param {Request} req
   * @param {Response} res
   */
  async lockUser(req, res) {
    try {
      const userId = req.params.id;
      const adminId = req.user?.sub || req.user?.id;
      
      // Prevent admin from locking themselves
      if (userId === adminId) {
        return sendResponse(res, 400, ApiResponse.error('Không thể khóa tài khoản của chính mình'));
      }
      
      const dto = UpdateUserDto.fromRequest({ trang_thai: 'khoa' });
      const result = await this.updateUserUseCase.execute(userId, dto, adminId);
      return sendResponse(res, 200, ApiResponse.success(result, 'Đã khóa tài khoản thành công'));
    } catch (error) {
      logError('Error locking user', { error: error.message, userId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi khóa tài khoản'));
    }
  }

  /**
   * Unlock user account
   * @param {Request} req
   * @param {Response} res
   */
  async unlockUser(req, res) {
    try {
      const userId = req.params.id;
      const adminId = req.user?.sub || req.user?.id;
      
      const dto = UpdateUserDto.fromRequest({ trang_thai: 'hoat_dong' });
      const result = await this.updateUserUseCase.execute(userId, dto, adminId);
      return sendResponse(res, 200, ApiResponse.success(result, 'Đã mở khóa tài khoản thành công'));
    } catch (error) {
      logError('Error unlocking user', { error: error.message, userId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi mở khóa tài khoản'));
    }
  }

  /**
   * Get user points (điểm rèn luyện)
   * @param {Request} req
   * @param {Response} res
   */
  async getUserPoints(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.getUserByIdUseCase.execute(userId);
      
      // Chỉ sinh viên mới có điểm rèn luyện
      if (!user.sinh_vien) {
        return sendResponse(res, 200, ApiResponse.success({
          points: [],
          totalPoints: 0,
          message: 'Người dùng này không phải sinh viên, không có điểm rèn luyện'
        }, 'Không có điểm rèn luyện'));
      }

      // Lấy điểm rèn luyện từ dashboard service
      const GetDetailedScoresUseCase = require('../../../dashboard/business/services/GetDetailedScoresUseCase');
      const DashboardRepository = require('../../../dashboard/data/repositories/dashboard.repository');
      const dashboardRepository = new DashboardRepository();
      const getDetailedScoresUseCase = new GetDetailedScoresUseCase(dashboardRepository);
      
      const pointsData = await getDetailedScoresUseCase.execute(userId, req.query);
      
      return sendResponse(res, 200, ApiResponse.success(pointsData, 'Lấy điểm rèn luyện thành công'));
    } catch (error) {
      logError('Error getting user points', { error: error.message, userId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi lấy điểm rèn luyện'));
    }
  }
}

module.exports = AdminUsersController;

