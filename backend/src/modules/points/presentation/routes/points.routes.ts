/**
 * Points Routes (V2)
 * RESTful endpoints for student points and attendance operations
 */
import { Router, Request, Response } from 'express';
import { createPointsController } from '../points.factory';
import { auth as authenticateJWT, requireDynamicPermission } from '../../../../core/http/middleware';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import { extractClassContext, applyClassScope } from '../../../../core/http/middleware/classScope';

const router = Router();
const pointsController = createPointsController();

// ── Scope middleware: auth + class-based data isolation ──
router.use(authenticateJWT);
router.use(asyncHandler(extractClassContext as any));
router.use(applyClassScope());

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
 * Requires: scores.read permission
 */
router.get('/filter-options', requireDynamicPermission('scores.read'), (req: Request, res: Response) => pointsController.getFilterOptions(req, res));

/**
 * GET /api/core/points/report
 * Get points report by academic year
 * Requires: scores.read permission
 */
router.get('/report', requireDynamicPermission('scores.read'), (req: Request, res: Response) => pointsController.getPointsReport(req, res));

export default router;
module.exports = router;
