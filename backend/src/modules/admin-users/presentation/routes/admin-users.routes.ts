/**
 * Admin Users Routes
 * Express router for admin user management endpoints
 */

import express, { Request, Response, Router } from 'express';
import { createAdminUsersController } from '../admin-users.factory';
import { auth as authenticateJWT, requireAdmin } from '../../../../core/http/middleware/authJwt';

const router: Router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateJWT);
router.use(requireAdmin);

// Create controller with all dependencies (Dependency Injection)
const adminUsersController = createAdminUsersController();

/**
 * @route   GET /api/core/admin/users/stats
 * @desc    Get user statistics (counts by role)
 * @access  Admin only
 */
router.get('/stats', (req: Request, res: Response) => adminUsersController.getStats(req, res));

/**
 * @route   GET /api/core/admin/users
 * @desc    Get paginated users list with filters
 * @access  Admin only
 * @query   page, limit, search, role, status (hoat_dong, khong_hoat_dong, khoa)
 */
router.get('/', (req: Request, res: Response) => adminUsersController.getUsers(req, res));

/**
 * @route   GET /api/core/admin/users/online
 * @desc    Get list of users currently online (with active sessions)
 * @access  Admin only
 */
router.get('/online', (req: Request, res: Response) => adminUsersController.getOnlineUsers(req, res));

/**
 * @route   GET /api/core/admin/users/export
 * @desc    Export users to CSV
 * @access  Admin only
 * @query   search, role, status
 */
router.get('/export', (req: Request, res: Response) => adminUsersController.exportUsers(req, res));

/**
 * @route   GET /api/core/admin/users/:id
 * @desc    Get user details by ID
 * @access  Admin only
 */
router.get('/:id', (req: Request, res: Response) => adminUsersController.getUserById(req, res));

/**
 * @route   POST /api/core/admin/users
 * @desc    Create new user
 * @access  Admin only
 * @body    {
 *   maso: string,
 *   hoten: string,
 *   email: string,
 *   password: string,
 *   role: string,
 *   mssv?: string,
 *   lop_id?: string,
 *   ngay_sinh?: string,
 *   gt?: 'nam' | 'nu' | 'khac',
 *   dia_chi?: string,
 *   sdt?: string,
 *   set_lop_truong?: boolean
 * }
 */
router.post('/', (req: Request, res: Response) => adminUsersController.createUser(req, res));

/**
 * @route   PUT /api/core/admin/users/:id
 * @desc    Update user
 * @access  Admin only
 * @body    {
 *   hoten?: string,
 *   email?: string,
 *   password?: string,
 *   role?: string
 * }
 */
router.put('/:id', (req: Request, res: Response) => adminUsersController.updateUser(req, res));

/**
 * @route   DELETE /api/core/admin/users/:id
 * @desc    Delete user completely from system
 * @access  Admin only
 */
router.delete('/:id', (req: Request, res: Response) => adminUsersController.deleteUser(req, res));

/**
 * @route   PATCH /api/core/admin/users/:id/lock
 * @desc    Lock user account (prevent login)
 * @access  Admin only
 */
router.patch('/:id/lock', (req: Request, res: Response) => adminUsersController.lockUser(req, res));

/**
 * @route   PATCH /api/core/admin/users/:id/unlock
 * @desc    Unlock user account (allow login)
 * @access  Admin only
 */
router.patch('/:id/unlock', (req: Request, res: Response) => adminUsersController.unlockUser(req, res));

/**
 * @route   GET /api/core/admin/users/:id/points
 * @desc    Get user points (điểm rèn luyện) - only for students
 * @access  Admin only
 */
router.get('/:id/points', (req: Request, res: Response) => adminUsersController.getUserPoints(req, res));

export default router;
module.exports = router;
