const { Router } = require('express');
const { auth: authenticateJWT, requireAdmin } = require('../middlewares/auth');
const AdminRegistrationsController = require('../controllers/admin.registrations.controller');

const router = Router();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * GET /api/v2/admin/registrations
 * V2 alias of legacy /admin/registrations (list with counts)
 */
router.get('/', (req, res) => AdminRegistrationsController.list(req, res));

/**
 * GET /api/v2/admin/registrations/export
 * V2 alias of legacy /admin/registrations/export (Excel export)
 */
router.get('/export', (req, res) => AdminRegistrationsController.export(req, res));

/**
 * POST /api/v2/admin/registrations/:id/approve
 * V2 alias of legacy /admin/registrations/:id/approve
 */
router.post('/:id/approve', (req, res) => AdminRegistrationsController.approve(req, res));

/**
 * POST /api/v2/admin/registrations/:id/reject
 * V2 alias of legacy /admin/registrations/:id/reject
 */
router.post('/:id/reject', (req, res) => AdminRegistrationsController.reject(req, res));

/**
 * POST /api/v2/admin/registrations/bulk
 * V2 alias of legacy /admin/registrations/bulk (bulk approve/reject)
 */
router.post('/bulk', (req, res) => AdminRegistrationsController.bulkUpdate(req, res));

module.exports = router;
