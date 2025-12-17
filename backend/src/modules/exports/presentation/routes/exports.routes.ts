/**
 * Exports Routes
 * Express router for export endpoints
 */

import express, { Request, Response, Router } from 'express';
import { createExportsController } from '../exports.factory';
import { auth, requireAdmin } from '../../../../core/http/middleware/authJwt';

const router: Router = express.Router();
const exportsController = createExportsController();

/**
 * @route   GET /api/core/exports/overview
 * @desc    Get overview statistics
 * @access  Private (Admin)
 */
router.get('/overview', auth, requireAdmin, (req: Request, res: Response) => exportsController.getOverview(req, res));

/**
 * @route   GET /api/core/exports/activities
 * @desc    Export activities to CSV
 * @access  Private (Admin)
 */
router.get('/activities', auth, requireAdmin, (req: Request, res: Response) => exportsController.exportActivities(req, res));

/**
 * @route   GET /api/core/exports/registrations
 * @desc    Export registrations to CSV
 * @access  Private (Admin)
 */
router.get('/registrations', auth, requireAdmin, (req: Request, res: Response) => exportsController.exportRegistrations(req, res));

export default router;
module.exports = router;
