/**
 * Registrations Routes - V2 API
 * Sử dụng CRUD Factory + custom endpoints
 */

import express, { Request, Response, Router } from 'express';
import { createRegistrationsController } from '../registrations.factory';
import { authJwt, requireDynamicPermission } from '../../../../core/http/middleware';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import { extractClassContext, applyClassScope } from '../../../../core/http/middleware/classScope';
import type { AuthenticatedRequest } from '../../../../core/http/middleware/authJwt';

const router: Router = express.Router();
const controller = createRegistrationsController();

// ── Scope middleware: extract class context + apply class-based data isolation ──
router.use(authJwt);
router.use(asyncHandler(extractClassContext as any));
router.use(applyClassScope());

// Base CRUD routes
router.get(
  '/',
  requireDynamicPermission('registrations.read'),
  asyncHandler((req: Request, res: Response) => controller.list(req as AuthenticatedRequest, res))
);

router.get(
  '/:id',
  requireDynamicPermission('registrations.read'),
  asyncHandler((req: Request, res: Response) => controller.get(req as AuthenticatedRequest, res))
);

router.post(
  '/',
  requireDynamicPermission('registrations.write'),
  asyncHandler((req: Request, res: Response) => controller.create(req as AuthenticatedRequest, res))
);

router.put(
  '/:id',
  requireDynamicPermission('registrations.write'),
  asyncHandler((req: Request, res: Response) => controller.update(req as AuthenticatedRequest, res))
);

router.delete(
  '/:id',
  requireDynamicPermission('registrations.delete'),
  asyncHandler((req: Request, res: Response) => controller.delete(req as AuthenticatedRequest, res))
);

// ========== Custom Endpoints ==========

/**
 * POST /registrations/:id/approve
 * Duyệt đăng ký (GIANG_VIEN, LOP_TRUONG, ADMIN)
 * Requires: registrations.write permission
 */
router.post(
  '/:id/approve',
  requireDynamicPermission('registrations.write'),
  asyncHandler((req: Request, res: Response) => controller.approve(req as AuthenticatedRequest, res))
);

/**
 * POST /registrations/:id/reject
 * Từ chối đăng ký
 * Requires: registrations.write permission
 */
router.post(
  '/:id/reject',
  requireDynamicPermission('registrations.write'),
  asyncHandler((req: Request, res: Response) => controller.reject(req as AuthenticatedRequest, res))
);

/**
 * POST /registrations/:id/cancel
 * Hủy đăng ký (student tự hủy)
 * Requires: registrations.delete permission
 */
router.post(
  '/:id/cancel',
  requireDynamicPermission('registrations.delete'),
  asyncHandler((req: Request, res: Response) => controller.cancel(req as AuthenticatedRequest, res))
);

/**
 * POST /registrations/:id/checkin
 * Điểm danh (GIANG_VIEN check attendance)
 * Requires: attendance.write permission
 */
router.post(
  '/:id/checkin',
  requireDynamicPermission('attendance.write'),
  asyncHandler((req: Request, res: Response) => controller.checkIn(req as AuthenticatedRequest, res))
);

/**
 * POST /registrations/bulk-approve
 * Duyệt nhiều đăng ký cùng lúc
 */
router.post(
  '/bulk-approve',
  requireDynamicPermission('registrations.write'),
  asyncHandler((req: Request, res: Response) => controller.bulkApprove(req as AuthenticatedRequest, res))
);

/**
 * GET /registrations/my
 * Lấy danh sách đăng ký của mình
 * Requires: registrations.read permission
 */
router.get(
  '/my',
  requireDynamicPermission('registrations.read'),
  asyncHandler((req: Request, res: Response) => controller.myRegistrations(req as AuthenticatedRequest, res))
);

/**
 * GET /registrations/activity/:activityId/stats
 * Lấy thống kê đăng ký của activity
 * Requires: registrations.read permission
 */
router.get(
  '/activity/:activityId/stats',
  requireDynamicPermission('registrations.read'),
  asyncHandler((req: Request, res: Response) => controller.activityStats(req as AuthenticatedRequest, res))
);

export default router;
export { router };
module.exports = router;
