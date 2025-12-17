import express, { Request, Response, Router } from 'express';
import { createActivityTypesController } from '../activity-types.factory';
import { auth as authenticateJWT, requireTeacher } from '../../../../core/http/middleware/authJwt';
import { uploadImage, handleUploadError } from '../../../../core/http/middleware/upload';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import type { AuthenticatedRequest } from '../controllers/ActivityTypesController';

const router: Router = express.Router();

const activityTypesController = createActivityTypesController();

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * @route   GET /api/core/activity-types
 * @desc    Get paginated list of activity types with search
 * @access  Authenticated users (students need this for filtering)
 */
router.get('/', asyncHandler((req: Request, res: Response) => activityTypesController.list(req, res)));

/**
 * @route   GET /api/core/activity-types/:id
 * @desc    Get single activity type by ID
 * @access  Authenticated users
 */
router.get('/:id', asyncHandler((req: Request, res: Response) => activityTypesController.getById(req, res)));

/**
 * @route   POST /api/core/activity-types
 * @desc    Create new activity type
 * @access  Teacher or Admin
 */
router.post('/', requireTeacher, asyncHandler((req: Request, res: Response) => activityTypesController.create(req as AuthenticatedRequest, res)));

/**
 * @route   POST /api/core/activity-types/upload-image
 * @desc    Upload image for activity type
 * @access  Teacher or Admin
 */
router.post('/upload-image', requireTeacher, uploadImage.single('image'), handleUploadError, asyncHandler((req: Request, res: Response) => activityTypesController.uploadImage(req as AuthenticatedRequest, res)));

/**
 * @route   PUT /api/core/activity-types/:id
 * @desc    Update existing activity type
 * @access  Teacher or Admin
 */
router.put('/:id', requireTeacher, asyncHandler((req: Request, res: Response) => activityTypesController.update(req as AuthenticatedRequest, res)));

/**
 * @route   DELETE /api/core/activity-types/:id
 * @desc    Delete activity type
 * @access  Teacher or Admin
 */
router.delete('/:id', requireTeacher, asyncHandler((req: Request, res: Response) => activityTypesController.delete(req as AuthenticatedRequest, res)));

export default router;
module.exports = router;
