const express = require('express');
const router = express.Router();
const { createAdminUsersController } = require('../admin-users.factory');
const { auth: authenticateJWT, requireAdmin } = require('../../../../core/http/middleware/authJwt');

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
router.get('/stats', (req, res) => adminUsersController.getStats(req, res));

/**
 * @route   GET /api/core/admin/users
 * @desc    Get paginated users list with filters
 * @access  Admin only
 * @query   page, limit, search, role, status (hoat_dong, khong_hoat_dong, khoa)
 */
router.get('/', (req, res) => adminUsersController.getUsers(req, res));

/**
 * @route   GET /api/core/admin/users/online
 * @desc    Get list of users currently online (with active sessions)
 * @access  Admin only
 */
router.get('/online', (req, res) => adminUsersController.getOnlineUsers(req, res));

/**
 * @route   GET /api/core/admin/users/export
 * @desc    Export users to CSV
 * @access  Admin only
 * @query   search, role, status
 */
router.get('/export', (req, res) => adminUsersController.exportUsers(req, res));

/**
 * @route   GET /api/core/admin/users/:id
 * @desc    Get user details by ID
 * @access  Admin only
 */
router.get('/:id', (req, res) => adminUsersController.getUserById(req, res));

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
router.post('/', (req, res) => adminUsersController.createUser(req, res));

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
router.put('/:id', (req, res) => adminUsersController.updateUser(req, res));

/**
 * @route   DELETE /api/core/admin/users/:id
 * @desc    Delete user completely from system
 * @access  Admin only
 */
router.delete('/:id', (req, res) => adminUsersController.deleteUser(req, res));

/**
 * @route   PATCH /api/core/admin/users/:id/lock
 * @desc    Lock user account (prevent login)
 * @access  Admin only
 */
router.patch('/:id/lock', (req, res) => adminUsersController.lockUser(req, res));

/**
 * @route   PATCH /api/core/admin/users/:id/unlock
 * @desc    Unlock user account (allow login)
 * @access  Admin only
 */
router.patch('/:id/unlock', (req, res) => adminUsersController.unlockUser(req, res));

/**
 * @route   GET /api/core/admin/users/:id/points
 * @desc    Get user points (điểm rèn luyện) - only for students
 * @access  Admin only
 */
router.get('/:id/points', (req, res) => adminUsersController.getUserPoints(req, res));

module.exports = router;

