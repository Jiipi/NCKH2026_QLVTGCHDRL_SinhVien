const express = require('express');
const router = express.Router();
const adminUsersService = require('../services/admin-users.service');
const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
const { logError } = require('../core/logger');
const { auth: authenticateJWT, requireAdmin } = require('../core/http/middleware/authJwt');
const { z } = require('zod');

// Apply authentication and admin authorization to all routes
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * @route   GET /api/core/admin/users
 * @desc    Get paginated users list with filters
 * @access  Admin only
 * @query   page, limit, search, role
 */
router.get('/', async (req, res) => {
  try {
    const result = await adminUsersService.getUsersAdmin(req.query);
    return sendResponse(res, 200, ApiResponse.success(result, 'Lấy danh sách người dùng thành công'));
  } catch (error) {
    logError('Error fetching users', { error: error.message, userId: req.user?.id });
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách người dùng'));
  }
});

/**
 * @route   GET /api/core/admin/users/export
 * @desc    Export users to CSV
 * @access  Admin only
 * @query   search, role, status
 */
router.get('/export', async (req, res) => {
  try {
    const csv = await adminUsersService.exportUsersCSV(req.query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    logError('Error export users', { error: error.message });
    return sendResponse(res, 500, ApiResponse.error('Lỗi xuất người dùng'));
  }
});

/**
 * @route   GET /api/core/admin/users/:id
 * @desc    Get user details by ID
 * @access  Admin only
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await adminUsersService.getUserByIdAdmin(req.params.id);
    return sendResponse(res, 200, ApiResponse.success(user, 'Lấy thông tin người dùng thành công'));
  } catch (error) {
    logError('Error fetching user details', { error: error.message, adminId: req.user?.id });
    const status = error.message.includes('không tìm thấy') ? 404 : 500;
    return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi lấy thông tin người dùng'));
  }
});

/**
 * @route   POST /api/core/admin/users
 * @desc    Create new user
 * @access  Admin only
 * @body    {
 *   maso: string,
 *   hoten: string,
 *   email: string,
 *   password: string,
 *   role: string,
 *   mssv?: string,
 *   lop_id?: string,
 *   ngay_sinh?: string,
 *   gt?: 'nam' | 'nu' | 'khac',
 *   dia_chi?: string,
 *   sdt?: string,
 *   set_lop_truong?: boolean
 * }
 */
router.post('/', async (req, res) => {
  try {
    const adminId = req.user?.sub || req.user?.id;
    const result = await adminUsersService.createUserAdmin(req.body, adminId);
    return sendResponse(res, 201, ApiResponse.success(result, 'Tạo người dùng thành công'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, ApiResponse.error('Dữ liệu không hợp lệ', error.errors));
    }

    logError('Error creating user', { error: error.message, userId: req.user?.id });
    const status = error.message.includes('đã tồn tại') ? 400 : 500;
    return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi tạo người dùng'));
  }
});

/**
 * @route   PUT /api/core/admin/users/:id
 * @desc    Update user
 * @access  Admin only
 * @body    {
 *   hoten?: string,
 *   email?: string,
 *   password?: string,
 *   role?: string
 * }
 */
router.put('/:id', async (req, res) => {
  try {
    const adminId = req.user?.sub || req.user?.id;
    const result = await adminUsersService.updateUserAdmin(req.params.id, req.body, adminId);
    return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật người dùng thành công'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, ApiResponse.error('Dữ liệu không hợp lệ', error.errors));
    }

    logError('Error updating user', { error: error.message, userId: req.user?.id });
    const status = error.message.includes('không tìm thấy') ? 404 : 500;
    return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi cập nhật người dùng'));
  }
});

/**
 * @route   DELETE /api/core/admin/users/:id
 * @desc    Delete user completely from system
 * @access  Admin only
 */
router.delete('/:id', async (req, res) => {
  try {
    const adminId = req.user?.sub || req.user?.id;
    await adminUsersService.deleteUserAdmin(req.params.id, adminId);
    return sendResponse(res, 200, ApiResponse.success(null, 'Đã xóa người dùng và toàn bộ dữ liệu liên quan khỏi hệ thống'));
  } catch (error) {
    logError('Error deleting user completely', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    const status = error.message.includes('không tìm thấy') ? 404 : 
                  error.message.includes('không thể xóa') ? 400 : 500;
    return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi xóa người dùng'));
  }
});

module.exports = router;




