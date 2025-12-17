import express, { Router, Request, Response } from 'express';
import { createNotificationTypesController } from '../notification-types.factory';
import { auth, requireAdmin } from '../../../../core/http/middleware/authJwt';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';

const router: Router = express.Router();
const notificationTypesController = createNotificationTypesController();

/**
 * @route   GET /api/core/notification-types
 * @desc    Get all notification types
 * @access  Private (Admin)
 */
router.get('/', auth, requireAdmin, asyncHandler((req: Request, res: Response) => notificationTypesController.list(req, res)));

/**
 * @route   GET /api/core/notification-types/:id
 * @desc    Get notification type by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, requireAdmin, asyncHandler((req: Request, res: Response) => notificationTypesController.getById(req, res)));

/**
 * @route   POST /api/core/notification-types
 * @desc    Create notification type
 * @access  Private (Admin)
 */
router.post('/', auth, requireAdmin, asyncHandler((req: Request, res: Response) => notificationTypesController.create(req, res)));

/**
 * @route   PUT /api/core/notification-types/:id
 * @desc    Update notification type
 * @access  Private (Admin)
 */
router.put('/:id', auth, requireAdmin, asyncHandler((req: Request, res: Response) => notificationTypesController.update(req, res)));

/**
 * @route   DELETE /api/core/notification-types/:id
 * @desc    Delete notification type
 * @access  Private (Admin)
 */
router.delete('/:id', auth, requireAdmin, asyncHandler((req: Request, res: Response) => notificationTypesController.delete(req, res)));

export default router;
module.exports = router;
