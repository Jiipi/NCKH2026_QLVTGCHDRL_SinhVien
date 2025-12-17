/**
 * Permissions Controller
 * API để frontend lấy quyền của user hiện tại
 */

import { Request, Response } from 'express';
import { getUserPermissions, clearPermissionsCache } from '../../../../core/http/middleware/dynamicPermission';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';

interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: string;
  };
}

/**
 * GET /api/auth/permissions
 * Lấy quyền hiện tại của user
 */
async function getCurrentPermissions(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const userId = req.user?.sub;
    
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
 */
async function clearCache(req: AuthRequest, res: Response): Promise<Response> {
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

export { getCurrentPermissions, clearCache };
export default { getCurrentPermissions, clearCache };
