/**
 * Broadcast Route
 * Admin-only routes for sending broadcast notifications
 * @module presentation/routes/broadcast
 */

import { Router, Request, Response } from 'express';
import broadcastService from '../../business/services/broadcast.service';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';
import { logError } from '../../core/logger';
import { auth as authenticateJWT, requireAdmin } from '../../core/http/middleware/authJwt';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * Broadcast notification request body
 */
interface BroadcastBody {
  tieu_de: string;
  noi_dung: string;
  scope: 'system' | 'role' | 'class' | 'department' | 'activity';
  loai_tb_id?: number;
  muc_do_uu_tien?: 'thap' | 'trung_binh' | 'cao';
  phuong_thuc_gui?: string;
  targetRole?: string;
  targetClass?: number;
  targetDepartment?: string;
  activityId?: number;
}

/**
 * @route   POST /api/core/broadcast
 * @desc    Send broadcast notification to multiple recipients
 * @access  Admin only
 */
router.post('/', async (req: Request<{}, {}, BroadcastBody>, res: Response) => {
  try {
    const senderId = String((req as any).user?.sub || (req as any).user?.id || '');

    if (!senderId || senderId === 'undefined' || senderId === 'null') {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người gửi'));
    }

    const result = await broadcastService.broadcastNotification({
      title: req.body.tieu_de,
      message: req.body.noi_dung,
      scope: req.body.scope,
      targetRole: req.body.targetRole,
      targetClass: req.body.targetClass,
      targetDepartment: req.body.targetDepartment,
      activityId: req.body.activityId,
      senderId // UUID string, not number
    });

    const statusCode = result.sentCount === 0 ? 200 : 201;
    return sendResponse(res, statusCode, ApiResponse.success(result, `Đã gửi thông báo tới ${result.sentCount} người nhận`));

  } catch (error) {
    const err = error as Error;
    logError('Error broadcasting notification', err, { userId: (req as any).user?.id });
    const statusCode = err.message.includes('Thiếu') || err.message.includes('không hợp lệ') ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi khi gửi thông báo'));
  }
});

/**
 * @route   GET /api/core/broadcast/stats
 * @desc    Get broadcast statistics (total, weekly, by scope)
 * @access  Admin only
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.sub || (req as any).user?.id;
    const stats = await broadcastService.getBroadcastStats(adminId);

    return sendResponse(res, 200, ApiResponse.success(stats, 'Lấy thống kê broadcast thành công'));

  } catch (error) {
    const err = error as Error;
    logError('Error fetching broadcast stats', { error: err.message, userId: (req as any).user?.id });
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy thống kê broadcast'));
  }
});

/**
 * @route   GET /api/core/broadcast/history
 * @desc    Get broadcast notification history
 * @access  Admin only
 * @query   limit?: number (default 500)
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.sub || (req as any).user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 500;

    const result = await broadcastService.getBroadcastHistory(adminId, limit);

    return sendResponse(res, 200, ApiResponse.success(result, 'Lấy lịch sử broadcast thành công'));

  } catch (error) {
    const err = error as Error;
    logError('Error fetching broadcast history', { error: err.message, userId: (req as any).user?.id });
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy lịch sử broadcast'));
  }
});

export default router;
