const express = require('express');
const router = express.Router();
const { createAdminUsersController } = require('./presentation/admin-users.factory');
const { auth: authenticateJWT, requireAdmin } = require('../../core/http/middleware/authJwt');

// Apply authentication and admin authorization to all routes
router.use(authenticateJWT);
router.use(requireAdmin);

// Create controller with all dependencies (Dependency Injection)
const adminUsersController = createAdminUsersController();

/**
 * @route   GET /api/core/admin/users
 * @desc    Get paginated users list with filters
 * @access  Admin only
 * @query   page, limit, search, role
 */
router.get('/', (req, res) => adminUsersController.getUsers(req, res));

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

module.exports = router;

