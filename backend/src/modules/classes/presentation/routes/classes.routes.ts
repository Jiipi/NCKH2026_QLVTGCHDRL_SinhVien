/**
 * Classes Routes - V2 API
 * Manual route definitions following clean architecture pattern
 */

import type { Router, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../controllers/ClassesController';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
const router: Router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClassesController } = require('../classes.factory');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const validators = require('../../business/validators/classes.validators');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { auth } = require('../../../../core/http/middleware/authJwt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { asyncHandler } = require('../../../../core/http/middleware/asyncHandler');

const classesController = createClassesController();

// All routes require authentication
router.use(auth);

// ==================== CUSTOM ROUTES (Must be before /:id) ====================

// Assign teacher to class
router.post(
  '/:id/assign-teacher',
  validators.validateAssignTeacher,
  asyncHandler((req: Request, res: Response) => classesController.assignTeacher(req as AuthenticatedRequest, res))
);

// Get students in class
router.get(
  '/:id/students',
  validators.validateGetById,
  asyncHandler((req: Request, res: Response) => classesController.getStudents(req as AuthenticatedRequest, res))
);

// Get activities for class
router.get(
  '/:id/activities',
  validators.validateGetById,
  asyncHandler((req: Request, res: Response) => classesController.getActivities(req as AuthenticatedRequest, res))
);

// ==================== CRUD ROUTES ====================

// List all classes
router.get(
  '/',
  validators.validateGetAll,
  asyncHandler((req: Request, res: Response) => classesController.getAll(req as AuthenticatedRequest, res))
);

// Get single class
router.get(
  '/:id',
  validators.validateGetById,
  asyncHandler((req: Request, res: Response) => classesController.getById(req as AuthenticatedRequest, res))
);

// Create class
router.post(
  '/',
  validators.validateCreate,
  asyncHandler((req: Request, res: Response) => classesController.create(req as AuthenticatedRequest, res))
);

// Update class
router.put(
  '/:id',
  validators.validateUpdate,
  asyncHandler((req: Request, res: Response) => classesController.update(req as AuthenticatedRequest, res))
);

// Delete class
router.delete(
  '/:id',
  validators.validateGetById,
  asyncHandler((req: Request, res: Response) => classesController.delete(req as AuthenticatedRequest, res))
);

export default router;
module.exports = router;
