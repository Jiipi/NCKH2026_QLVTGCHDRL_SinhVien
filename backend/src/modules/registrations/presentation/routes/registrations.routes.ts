/**
 * Registrations Routes - V2 API
 * Sử dụng CRUD Factory + custom endpoints
 */

import express, { Request, Response, Router } from 'express';
import { createRegistrationsController } from '../registrations.factory';
import { authJwt, requireDynamicPermission } from '../../../../core/http/middleware';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import type { AuthenticatedRequest } from '../../../../core/http/middleware/authJwt';

const router: Router = express.Router();
const controller = createRegistrationsController();

// Base CRUD routes
router.get(
  '/',
  authJwt,
  requireDynamicPermission('registrations.read'),
  asyncHandler((req: Request, res: Response) => controller.list(req as AuthenticatedRequest, res))
);

router.get(
  '/:id',
  authJwt,
  requireDynamicPermission('registrations.read'),
  asyncHandler((req: Request, res: Response) => controller.get(req as AuthenticatedRequest, res))
);

router.post(
  '/',
  authJwt,
  requireDynamicPermission('registrations.write'),
  asyncHandler((req: Request, res: Response) => controller.create(req as AuthenticatedRequest, res))
);

router.put(
  '/:id',
  authJwt,
  requireDynamicPermission('registrations.write'),
  asyncHandler((req: Request, res: Response) => controller.update(req as AuthenticatedRequest, res))
);

router.delete(
  '/:id',
  authJwt,
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
  authJwt, 
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
  authJwt, 
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
  authJwt, 
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
  authJwt, 
  requireDynamicPermission('attendance.write'), 
  asyncHandler((req: Request, res: Response) => controller.checkIn(req as AuthenticatedRequest, res))
);

/**
 * POST /registrations/bulk-approve
 * Duyệt nhiều đăng ký cùng lúc
 */
router.post(
  '/bulk-approve', 
  authJwt, 
  asyncHandler((req: Request, res: Response) => controller.bulkApprove(req as AuthenticatedRequest, res))
);

/**
 * GET /registrations/my
 * Lấy danh sách đăng ký của mình
 * Requires: registrations.read permission
 */
router.get(
  '/my', 
  authJwt, 
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
  authJwt, 
  requireDynamicPermission('registrations.read'), 
  asyncHandler((req: Request, res: Response) => controller.activityStats(req as AuthenticatedRequest, res))
);

export default router;
export { router };
module.exports = router;
