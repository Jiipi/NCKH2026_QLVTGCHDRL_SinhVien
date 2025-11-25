/**
 * Permissions Controller
 * API để frontend lấy quyền của user hiện tại
 */

const { getUserPermissions, clearPermissionsCache } = require('../../../../core/http/middleware/dynamicPermission');
const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');

/**
 * GET /api/auth/permissions
 * Lấy quyền hiện tại của user
 * Frontend sẽ gọi API này để:
 * 1. Lúc đầu login để lấy permissions
 * 2. Polling mỗi 30s để cập nhật realtime
 * 3. Khi nhận được 403 error từ một API khác
 */
async function getCurrentPermissions(req, res) {
  try {
    const userId = req.user.sub;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập'));
    }

    const permissions = await getUserPermissions(userId);

    return sendResponse(res, 200, ApiResponse.success({
      userId,
      permissions,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    logError('Error getting current permissions:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy quyền'));
  }
}

/**
 * POST /api/auth/permissions/clear-cache
 * Clear permissions cache (Admin only)
 * Dùng sau khi admin update quyền của một role
 */
async function clearCache(req, res) {
  try {
    const { userId } = req.body;
    
    // Clear cache for specific user or all users
    clearPermissionsCache(userId);

    return sendResponse(res, 200, ApiResponse.success({
      message: userId 
        ? `Đã xóa cache quyền của user ${userId}` 
        : 'Đã xóa cache quyền của tất cả users',
    }));
  } catch (error) {
    logError('Error clearing permissions cache:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi xóa cache'));
  }
}

module.exports = {
  getCurrentPermissions,
  clearCache,
};
