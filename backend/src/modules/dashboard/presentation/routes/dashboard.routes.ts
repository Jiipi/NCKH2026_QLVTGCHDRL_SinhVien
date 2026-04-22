/**
 * Dashboard Routes
 * Express routes for dashboard module
 */

import { Router, type Request, type Response } from 'express';
import { requireAdmin, requireTeacher } from '../../../../core/http/middleware/authJwt';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import { createDashboardController } from '../dashboard.factory';

const router = Router();
const dashboardController = createDashboardController();

// ── Scope middleware: auth + class-based data isolation ──
// Note: Authentication and semester validation are applied in main routes.ts
// router.use(auth);
// router.use(asyncHandler(extractClassContext));
// router.use(applyClassScope());

/**
 * GET /api/core/dashboard/student
 * Get student dashboard data with points summary and activities
 * Query params: semester (optional) - format: hoc_ky_1-2024 or hoc_ky_2-2024
 * Auth: Applied in routes.ts via authenticate + validateAndInjectSemester + applyScope
 */
router.get('/student', asyncHandler((req: Request, res: Response) =>
  dashboardController.getStudentDashboard(req as unknown as Parameters<typeof dashboardController.getStudentDashboard>[0], res)
));

/**
 * GET /api/core/dashboard/activity-stats
 * Get activity statistics by time range (for admin/teacher)
 * Query params: timeRange (optional) - values: 7d, 30d, 90d (default: 30d)
 * Auth: Applied in routes.ts
 */
router.get('/activity-stats', requireTeacher, asyncHandler((req: Request, res: Response) =>
  dashboardController.getActivityStats(req, res)
));

/**
 * GET /api/core/dashboard/admin
 * Get admin dashboard statistics (Admin only)
 * Returns system-wide overview: total users, activities, registrations, pending approvals
 * Requires: ADMIN role
 */
router.get('/admin', requireAdmin, asyncHandler((req: Request, res: Response) =>
  dashboardController.getAdminDashboard(req as unknown as Parameters<typeof dashboardController.getAdminDashboard>[0], res)
));

/**
 * GET /api/core/dashboard/activities/me
 * Get my registered activities (ALL, not just recent 5)
 * Query params: semester (optional)
 * Auth: Applied in routes.ts
 */
router.get('/activities/me', asyncHandler((req: Request, res: Response) =>
  dashboardController.getMyActivities(req as unknown as Parameters<typeof dashboardController.getMyActivities>[0], res)
));

/**
 * GET /api/core/dashboard/scores/detailed
 * Get detailed score breakdown by criteria
 * Query params: semester, year
 * Auth: Applied in routes.ts
 */
router.get('/scores/detailed', asyncHandler((req: Request, res: Response) =>
  dashboardController.getDetailedScores(req as unknown as Parameters<typeof dashboardController.getDetailedScores>[0], res)
));

export default router;
module.exports = router;
