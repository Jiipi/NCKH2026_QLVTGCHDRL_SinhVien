import express, { type Router, type Request, type Response } from 'express';
import { createProfileController } from '../profile.factory';
import { auth, requireDynamicPermission } from '../../../../core/http/middleware';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import type { AuthenticatedRequest } from '../controllers/ProfileController';

const router: Router = express.Router();
const profileController = createProfileController();

/**
 * @route   GET /api/core/profile
 * @desc    Get current user profile
 * @access  Private (Requires profile.read permission)
 */
router.get(
  '/',
  auth,
  requireDynamicPermission('profile.read'),
  asyncHandler((req: Request, res: Response) =>
    profileController.getProfile(req as AuthenticatedRequest, res)
  )
);

/**
 * @route   PUT /api/core/profile
 * @desc    Update current user profile
 * @access  Private (Requires profile.update permission)
 */
router.put(
  '/',
  auth,
  requireDynamicPermission('profile.update'),
  asyncHandler((req: Request, res: Response) =>
    profileController.updateProfile(req as AuthenticatedRequest, res)
  )
);

/**
 * @route   POST /api/core/profile/change-password
 * @desc    Change current user password
 * @access  Private
 */
router.post(
  '/change-password',
  auth,
  asyncHandler((req: Request, res: Response) =>
    profileController.changePassword(req as AuthenticatedRequest, res)
  )
);

/**
 * @route   GET /api/core/profile/monitor-status
 * @desc    Check if current user is a class monitor
 * @access  Private
 */
router.get(
  '/monitor-status',
  auth,
  asyncHandler((req: Request, res: Response) =>
    profileController.checkMonitorStatus(req as AuthenticatedRequest, res)
  )
);

export default router;
module.exports = router;
