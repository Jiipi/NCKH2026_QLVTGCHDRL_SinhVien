/**
 * Health Route
 * Simple health check endpoint
 * @module presentation/routes/health
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
