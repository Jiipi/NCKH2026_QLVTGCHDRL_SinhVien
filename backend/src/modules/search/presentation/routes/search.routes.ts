/**
 * Search Routes
 * Express router for search endpoints
 */

import express, { Request, Response, Router } from 'express';
import { createSearchController } from '../search.factory';
import { auth } from '../../../../core/http/middleware/authJwt';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';

const router: Router = express.Router();
const searchController = createSearchController();

/**
 * @route   GET /api/search
 * @desc    Global search across activities, students, classes, teachers
 * @access  Private (All authenticated users)
 */
router.get('/', auth, asyncHandler((req: Request, res: Response) => searchController.globalSearch(req, res)));

export default router;
module.exports = router;
