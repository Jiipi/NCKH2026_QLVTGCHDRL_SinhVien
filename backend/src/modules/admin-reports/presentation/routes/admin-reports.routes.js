const { Router } = require('express');
const { createAdminReportsController } = require('../admin-reports.factory');
const { auth: authenticateJWT, requireAdmin } = require('../../../../core/http/middleware/authJwt');

const router = Router();
const adminReportsController = createAdminReportsController();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * GET /api/core/admin/reports/users/:id/points
 * Get detailed points report for a specific user
 */
router.get('/users/:id/points', (req, res) => adminReportsController.getUserPointsReport(req, res));

/**
 * GET /api/core/admin/reports/attendance
 * Get paginated attendance report with filters
 */
router.get('/attendance', (req, res) => adminReportsController.getAttendanceReport(req, res));

/**
 * GET /api/core/admin/reports/classes
 * Get all classes with student counts
 */
router.get('/classes', (req, res) => adminReportsController.getClassesList(req, res));

/**
 * GET /api/core/admin/reports/overview
 * Get overview statistics for admin dashboard
 */
router.get('/overview', (req, res) => adminReportsController.getOverview(req, res));

/**
 * GET /api/core/admin/reports/export/activities
 * Export activities to CSV
 */
router.get('/export/activities', (req, res) => adminReportsController.exportActivities(req, res));

/**
 * GET /api/core/admin/reports/export/registrations
 * Export registrations to CSV
 */
router.get('/export/registrations', (req, res) => adminReportsController.exportRegistrations(req, res));

module.exports = router;

