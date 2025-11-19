const express = require('express');
const router = express.Router();
const RolesService = require('./roles.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { auth, requireAdmin, clearPermissionsCache } = require('../../core/http/middleware');

/**
 * @route   GET /api/core/roles
 * @desc    Get all roles with pagination
 * @access  Private (Admin)
 */
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await RolesService.list({ page, limit, search });
    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách vai trò'));
  }
});

/**
 * @route   GET /api/core/roles/:id
 * @desc    Get role by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const role = await RolesService.getById(id);
    return sendResponse(res, 200, ApiResponse.success(role));
  } catch (error) {
    if (error.message === 'ROLE_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy vai trò'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy vai trò'));
  }
});

/**
 * @route   POST /api/core/roles
 * @desc    Create new role
 * @access  Private (Admin)
 */
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.sub;
    const role = await RolesService.create(req.body, adminId);
    return sendResponse(res, 201, ApiResponse.success(role, 'Tạo vai trò thành công'));
  } catch (error) {
    if (error.message === 'ROLE_NAME_REQUIRED') {
      return sendResponse(res, 400, ApiResponse.error('Tên vai trò là bắt buộc'));
    }
    if (error.message === 'ROLE_ALREADY_EXISTS') {
      return sendResponse(res, 400, ApiResponse.error('Vai trò đã tồn tại'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi tạo vai trò'));
  }
});

/**
 * @route   PUT /api/core/roles/:id
 * @desc    Update role
 * @access  Private (Admin)
 */
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const role = await RolesService.update(id, req.body);
    
    // Clear permissions cache khi update role để users có quyền mới ngay lập tức
    clearPermissionsCache();
    
    return sendResponse(res, 200, ApiResponse.success(role, 'Cập nhật vai trò thành công'));
  } catch (error) {
    console.error('❌ Error updating role:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật vai trò: ' + error.message));
  }
});

/**
 * @route   DELETE /api/core/roles/:id
 * @desc    Delete role
 * @access  Private (Admin)
 */
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reassignTo, cascadeUsers } = req.query || {};
    
    await RolesService.delete(id, { reassignTo, cascadeUsers });
    return sendResponse(res, 200, ApiResponse.success(null, 'Xóa vai trò thành công'));
  } catch (error) {
    if (error.message === 'ROLE_IN_USE') {
      return sendResponse(res, 409, ApiResponse.error(
        `Không thể xóa vai trò do còn ${error.usersCount} người dùng đang sử dụng. ` +
        `Vui lòng gán sang vai trò khác trước (reassignTo) hoặc gọi lại với ?cascadeUsers=true để xóa cả người dùng.`
      ));
    }
    if (error.message === 'REASSIGN_ROLE_NOT_FOUND') {
      return sendResponse(res, 400, ApiResponse.error('Vai trò đích (reassignTo) không tồn tại'));
    }
    if (error.message === 'USERS_ARE_CLASS_HOMEROOM') {
      return sendResponse(res, 409, ApiResponse.error(
        'Không thể xóa vì còn người dùng đang là chủ nhiệm lớp. Hãy chuyển chủ nhiệm lớp trước.'
      ));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi xóa vai trò'));
  }
});

/**
 * @route   POST /api/core/roles/:id/assign
 * @desc    Assign role to users
 * @access  Private (Admin)
 */
router.post('/:id/assign', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_ids } = req.body;
    const adminId = req.user.sub;
    
    const result = await RolesService.assignToUsers(id, user_ids, adminId);
    return sendResponse(res, 200, ApiResponse.success(result, `Đã gán vai trò cho ${result.count} người dùng`));
  } catch (error) {
    if (error.message === 'INVALID_USER_IDS') {
      return sendResponse(res, 400, ApiResponse.error('Danh sách người dùng không hợp lệ'));
    }
    if (error.message === 'ROLE_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy vai trò'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi gán vai trò'));
  }
});

/**
 * @route   DELETE /api/core/roles/user/:userId
 * @desc    Remove role from user (not allowed)
 * @access  Private (Admin)
 */
router.delete('/user/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await RolesService.removeFromUser(userId);
    return sendResponse(res, 200, ApiResponse.success(null));
  } catch (error) {
    if (error.message === 'CANNOT_REMOVE_ROLE') {
      return sendResponse(res, 400, ApiResponse.error(
        'Không thể xóa vai trò khỏi người dùng. Hãy gán vai trò khác thay thế.'
      ));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi xóa vai trò'));
  }
});

module.exports = router;





