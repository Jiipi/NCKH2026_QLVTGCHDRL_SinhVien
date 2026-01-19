/**
 * Departments Route - V2 API
 * Returns unique department (khoa) values from classes
 */

import { Router, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require('../../data/infrastructure/prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { auth } = require('../../core/http/middleware/authJwt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const router: Router = Router();

// All routes require authentication
router.use(auth);

/**
 * GET /core/departments
 * Get list of unique departments (khoa) from classes
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    // Get distinct khoa values from Lop table
    const classes = await prisma.lop.findMany({
      select: {
        khoa: true
      },
      distinct: ['khoa'],
      orderBy: {
        khoa: 'asc'
      }
    });

    // Extract unique khoa values and filter out nulls/empty
    const departments = classes
      .map((c: { khoa: string | null }) => c.khoa)
      .filter((k: string | null): k is string => k !== null && k.trim() !== '')
      .map((name: string, index: number) => ({
        id: `dept-${index + 1}`,
        name,
        code: name.substring(0, 4).toUpperCase()
      }));

    res.json({
      success: true,
      data: departments,
      total: departments.length
    });
  })
);

export default router;
module.exports = router;
