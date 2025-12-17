/**
 * Activities Routes
 * PRESENTATION LAYER - Route definitions
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import ActivitiesController from '../controllers/ActivitiesController';
import { createActivitiesController } from '../activities.factory';

const validators = require('../../business/validators/activities.validators');
const { auth, requireDynamicPermission } = require('../../../../core/http/middleware');
const { asyncHandler } = require('../../../../core/http/middleware/asyncHandler');
const { extractClassContext, applyClassScope } = require('../../../../core/http/middleware/classScope');

/**
 * Creates activities router with dependency-injected controller
 * @param controller - The activities controller instance
 * @returns Express Router with all activity routes configured
 */
function createActivitiesRouter(controller: InstanceType<typeof ActivitiesController>): Router {
  const router = Router();

  // All routes require authentication
  router.use(auth);

  // Extract class context for scope filtering
  router.use(asyncHandler(extractClassContext));

  // Apply class-based scope
  router.use(applyClassScope());

  // ==================== CRUD ROUTES ====================

  // List all activities
  router.get(
    '/',
    requireDynamicPermission('activities.read'),
    validators.validateGetAll,
    asyncHandler((req: Request, res: Response) => controller.getAll(req, res))
  );

  // Get QR data (must be before /:id route)
  router.get(
    '/:id/qr-data',
    (req: Request, res: Response, next: NextFunction) => {
      console.log('[QR-Data Route] Middleware - Request received:', req.params.id);
      next();
    },
    requireDynamicPermission('activities.read'),
    (req: Request, res: Response, next: NextFunction) => {
      console.log('[QR-Data Route] After permission check');
      next();
    },
    validators.validateGetById,
    (req: Request, res: Response, next: NextFunction) => {
      console.log('[QR-Data Route] After validation');
      next();
    },
    asyncHandler((req: Request, res: Response) => {
      console.log('[QR-Data Route] Calling controller');
      return controller.getQRData(req, res);
    })
  );

  // Get activity details with registrations
  router.get(
    '/:id/details',
    requireDynamicPermission('activities.read'),
    validators.validateGetById,
    asyncHandler((req: Request, res: Response) => controller.getDetails(req, res))
  );

  // Get single activity
  router.get(
    '/:id',
    requireDynamicPermission('activities.read'),
    validators.validateGetById,
    asyncHandler((req: Request, res: Response) => controller.getById(req, res))
  );

  // Create activity
  router.post(
    '/',
    requireDynamicPermission('activities.write'),
    validators.validateCreate,
    asyncHandler((req: Request, res: Response) => controller.create(req, res))
  );

  // Update activity
  router.put(
    '/:id',
    requireDynamicPermission('activities.write'),
    validators.validateUpdate,
    asyncHandler((req: Request, res: Response) => controller.update(req, res))
  );

  // Delete activity
  router.delete(
    '/:id',
    requireDynamicPermission('activities.delete'),
    validators.validateGetById,
    asyncHandler((req: Request, res: Response) => controller.delete(req, res))
  );

  // ==================== APPROVAL ROUTES ====================

  // Approve activity
  router.post(
    '/:id/approve',
    requireDynamicPermission('activities.approve'),
    validators.validateApprove,
    asyncHandler((req: Request, res: Response) => controller.approve(req, res))
  );

  // Reject activity
  router.post(
    '/:id/reject',
    requireDynamicPermission('activities.approve'),
    validators.validateReject,
    asyncHandler((req: Request, res: Response) => controller.reject(req, res))
  );

  // ==================== REGISTRATION ROUTES ====================

  // Register for activity
  router.post(
    '/:id/register',
    requireDynamicPermission('registrations.write'),
    validators.validateRegister,
    asyncHandler((req: Request, res: Response) => controller.register(req, res))
  );

  // Cancel registration
  router.post(
    '/:id/cancel',
    requireDynamicPermission('registrations.delete'),
    validators.validateGetById,
    asyncHandler((req: Request, res: Response) => controller.cancelRegistration(req, res))
  );

  // ==================== ATTENDANCE (QR SELF-SCAN) ====================

  // Student self check-in via QR scan
  router.post(
    '/:id/attendance/scan',
    requireDynamicPermission('attendance.write'),
    validators.validateGetById,
    asyncHandler((req: Request, res: Response) => controller.scanAttendance(req, res))
  );

  return router;
}

// Create default router with injected controller
const activitiesController = createActivitiesController();
const router = createActivitiesRouter(activitiesController);

export default createActivitiesRouter;

// CommonJS compatibility
module.exports = createActivitiesRouter;
module.exports.default = createActivitiesRouter;
module.exports.router = router;
