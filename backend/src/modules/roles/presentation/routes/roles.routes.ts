import express, { Request, Response, Router } from 'express';
import { createRolesController } from '../roles.factory';
import { auth, requireAdmin, clearPermissionsCache } from '../../../../core/http/middleware';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';

const router: Router = express.Router();
const rolesController = createRolesController();

/**
 * @route   GET /api/core/roles
 * @desc    Get all roles with pagination
 * @access  Private (Admin)
 */
router.get('/', auth, requireAdmin, asyncHandler((req: Request, res: Response) => rolesController.list(req, res)));

/**
 * @route   GET /api/core/roles/:id
 * @desc    Get role by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, requireAdmin, asyncHandler((req: Request, res: Response) => rolesController.getById(req, res)));

/**
 * @route   POST /api/core/roles
 * @desc    Create new role
 * @access  Private (Admin)
 */
router.post('/', auth, requireAdmin, asyncHandler((req: Request, res: Response) => rolesController.create(req as unknown as Parameters<typeof rolesController.create>[0], res)));

/**
 * @route   PUT /api/core/roles/:id
 * @desc    Update role
 * @access  Private (Admin)
 */
router.put('/:id', auth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  // Clear permissions cache TRƯỚC khi update để đảm bảo users sẽ lấy permissions mới
  clearPermissionsCache();
  const result = await rolesController.update(req, res);
  // Clear cache SAU khi update thành công để đảm bảo
  clearPermissionsCache();
  return result;
}));

/**
 * @route   DELETE /api/core/roles/:id
 * @desc    Delete role
 * @access  Private (Admin)
 */
router.delete('/:id', auth, requireAdmin, asyncHandler((req: Request, res: Response) => rolesController.delete(req, res)));

/**
 * @route   POST /api/core/roles/:id/assign
 * @desc    Assign role to users
 * @access  Private (Admin)
 */
router.post('/:id/assign', auth, requireAdmin, asyncHandler((req: Request, res: Response) => rolesController.assignToUsers(req as unknown as Parameters<typeof rolesController.assignToUsers>[0], res)));

/**
 * @route   DELETE /api/core/roles/user/:userId
 * @desc    Remove role from user (not allowed)
 * @access  Private (Admin)
 */
router.delete('/user/:userId', auth, requireAdmin, asyncHandler((req: Request, res: Response) => rolesController.removeFromUser(req, res)));

export default router;
module.exports = router;
