/**
 * Admin Reports Routes
 * API routes for admin reports
 */
import { Router, Request, Response } from 'express';
import { createAdminReportsController } from '../admin-reports.factory';
import { auth as authenticateJWT, requireAdmin } from '../../../../core/http/middleware/authJwt';

const router = Router();
const adminReportsController = createAdminReportsController();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * GET /api/core/admin/reports/users/:id/points
 * Get detailed points report for a specific user
 */
router.get('/users/:id/points', (req: Request, res: Response) =>
  adminReportsController.getUserPointsReport(req, res)
);

/**
 * GET /api/core/admin/reports/attendance
 * Get paginated attendance report with filters
 */
router.get('/attendance', (req: Request, res: Response) =>
  adminReportsController.getAttendanceReport(req, res)
);

router.get('/attendance-audit', (req: Request, res: Response) =>
  adminReportsController.getAttendanceAuditReport(req, res)
);

/**
 * GET /api/core/admin/reports/classes
 * Get all classes with student counts
 */
router.get('/classes', (req: Request, res: Response) =>
  adminReportsController.getClassesList(req, res)
);

/**
 * GET /api/core/admin/reports/overview
 * Get overview statistics for admin dashboard
 */
router.get('/overview', (req: Request, res: Response) =>
  adminReportsController.getOverview(req, res)
);

/**
 * GET /api/core/admin/reports/export/activities
 * Export activities to CSV
 */
router.get('/export/activities', (req: Request, res: Response) =>
  adminReportsController.exportActivities(req, res)
);

/**
 * GET /api/core/admin/reports/export/registrations
 * Export registrations to CSV
 */
router.get('/export/registrations', (req: Request, res: Response) =>
  adminReportsController.exportRegistrations(req, res)
);

export default router;
module.exports = router;
