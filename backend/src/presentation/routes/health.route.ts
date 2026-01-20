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
  throw new Error('Demo CI Fail'); // ← XÓA DÒNG NÀY ĐỂ PASS
  res.json({
    status: 'ok',
    service: 'dacn-backend',
    version: process.env.APP_VERSION || 'dev',
    commit: process.env.GIT_SHA || 'local',
    timestamp: new Date().toISOString(),
  });
});

export default router;