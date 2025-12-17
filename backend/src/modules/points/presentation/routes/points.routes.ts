/**
 * Points Routes (V2)
 * RESTful endpoints for student points and attendance operations
 */
import { Router, Request, Response } from 'express';
import { createPointsController } from '../points.factory';
import { auth as authenticateJWT, requireDynamicPermission } from '../../../../core/http/middleware';

const router = Router();
const pointsController = createPointsController();

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * GET /api/core/points/summary
 * Get points summary for current student
 * Requires: scores.read permission
 */
router.get('/summary', requireDynamicPermission('scores.read'), (req: Request, res: Response) =>
  pointsController.getPointsSummary(req, res)
);

/**
 * GET /api/core/points/detail
 * Get detailed points with pagination
 * Requires: scores.read permission
 */
router.get('/detail', requireDynamicPermission('scores.read'), (req: Request, res: Response) =>
  pointsController.getPointsDetail(req, res)
);

/**
 * GET /api/core/points/attendance-history
 * Get attendance history
 * Requires: attendance.read permission
 */
router.get('/attendance-history', requireDynamicPermission('attendance.read'), (req: Request, res: Response) =>
  pointsController.getAttendanceHistory(req, res)
);

/**
 * GET /api/core/points/filter-options
 * Get available semesters and academic years
 */
router.get('/filter-options', (req: Request, res: Response) => pointsController.getFilterOptions(req, res));

/**
 * GET /api/core/points/report
 * Get points report by academic year
 */
router.get('/report', (req: Request, res: Response) => pointsController.getPointsReport(req, res));

export default router;
module.exports = router;
