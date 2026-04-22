/**
 * Users Routes - V2 API
 * Manual route definitions following clean architecture pattern
 */

import { Router, Request, Response } from 'express';
import { createUsersController } from '../users.factory';
import * as validators from '../../business/validators/users.validators';
import { auth } from '../../../../core/http/middleware/authJwt';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';

const router: Router = Router();
const usersController = createUsersController();

// All routes require authentication
router.use(auth);

// ==================== CUSTOM ROUTES (Must be before /:id) ====================

// Search users
router.get(
  '/search',
  validators.validateSearch,
  asyncHandler((req: Request, res: Response) => usersController.search(req, res))
);

// Get user statistics
router.get(
  '/stats',
  asyncHandler((req: Request, res: Response) => usersController.getStats(req, res))
);

// Get current user profile
router.get(
  '/me',
  asyncHandler((req: Request, res: Response) => usersController.getMe(req, res))
);

// Get users by class
router.get(
  '/class/:className',
  validators.validateGetByClass,
  asyncHandler((req: Request, res: Response) => usersController.getByClass(req, res))
);

// ==================== CRUD ROUTES ====================

// List all users
router.get(
  '/',
  validators.validateGetAll,
  asyncHandler((req: Request, res: Response) => usersController.getAll(req, res))
);

// Get single user
router.get(
  '/:id',
  validators.validateGetById,
  asyncHandler((req: Request, res: Response) => usersController.getById(req, res))
);

// Create user
router.post(
  '/',
  validators.validateCreate,
  asyncHandler((req: Request, res: Response) => usersController.create(req, res))
);

// Update user
router.put(
  '/:id',
  validators.validateUpdate,
  asyncHandler((req: Request, res: Response) => usersController.update(req, res))
);

// Delete user
router.delete(
  '/:id',
  validators.validateGetById,
  asyncHandler((req: Request, res: Response) => usersController.delete(req, res))
);

export default router;
module.exports = router;
