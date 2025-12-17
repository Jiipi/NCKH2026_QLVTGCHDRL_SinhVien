/**
 * Dashboard Routes
 * Express routes for dashboard module
 */

import { Router, type Request, type Response } from 'express';
import { auth } from '../../../../core/http/middleware/authJwt';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import { createDashboardController } from '../dashboard.factory';

const router = Router();
const dashboardController = createDashboardController();

router.use(auth);

/**
 * GET /api/core/dashboard/student
 * Get student dashboard data with points summary and activities
 * Query params: semester (optional) - format: hoc_ky_1-2024 or hoc_ky_2-2024
 */
router.get('/student', asyncHandler((req: Request, res: Response) => 
  dashboardController.getStudentDashboard(req as any, res)
));

/**
 * GET /api/core/dashboard/activity-stats
 * Get activity statistics by time range (for admin/teacher)
 * Query params: timeRange (optional) - values: 7d, 30d, 90d (default: 30d)
 */
router.get('/activity-stats', asyncHandler((req: Request, res: Response) => 
  dashboardController.getActivityStats(req, res)
));

/**
 * GET /api/core/dashboard/admin
 * Get admin dashboard statistics (Admin only)
 * Returns system-wide overview: total users, activities, registrations, pending approvals
 */
router.get('/admin', asyncHandler((req: Request, res: Response) => 
  dashboardController.getAdminDashboard(req, res)
));

/**
 * GET /api/core/dashboard/activities/me
 * Get my registered activities (ALL, not just recent 5)
 * Query params: semester (optional)
 */
router.get('/activities/me', asyncHandler((req: Request, res: Response) => 
  dashboardController.getMyActivities(req as any, res)
));

/**
 * GET /api/core/dashboard/scores/detailed
 * Get detailed score breakdown by criteria
 * Query params: semester, year
 */
router.get('/scores/detailed', asyncHandler((req: Request, res: Response) => 
  dashboardController.getDetailedScores(req as any, res)
));

export default router;
module.exports = router;
