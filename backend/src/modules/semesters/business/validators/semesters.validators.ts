/**
 * Semesters Module Validators
 * Zod schemas for semester operations input validation
 */

import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Semester string pattern: HK_YYYY (e.g., 1_2024-2025)
 */
const semesterPattern = /^\d_\d{4}-\d{4}$/;

/**
 * Propose closure validation schema
 */
const proposeClosureSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Class ID không hợp lệ'),
    semester: z.string().regex(semesterPattern, 'Học kỳ không hợp lệ (format: HK_YYYY)'),
  }),
});

/**
 * Soft lock validation schema
 */
const softLockSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Class ID không hợp lệ'),
    semester: z.string().regex(semesterPattern, 'Học kỳ không hợp lệ'),
    graceHours: z.number().int().min(0).max(720).optional(),
  }),
});

/**
 * Hard lock validation schema
 */
const hardLockSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Class ID không hợp lệ'),
    semester: z.string().regex(semesterPattern, 'Học kỳ không hợp lệ'),
  }),
});

/**
 * Rollback validation schema
 */
const rollbackSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Class ID không hợp lệ'),
    semester: z.string().regex(semesterPattern, 'Học kỳ không hợp lệ'),
  }),
});

/**
 * Get semester status params validation
 */
const getSemesterStatusSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Class ID không hợp lệ'),
    semester: z.string().regex(semesterPattern, 'Học kỳ không hợp lệ'),
  }),
});

/**
 * Get activities by semester params validation
 */
const getActivitiesBySemesterSchema = z.object({
  params: z.object({
    classId: z.string().uuid('Class ID không hợp lệ'),
    semester: z.string().regex(semesterPattern, 'Học kỳ không hợp lệ'),
  }),
});

/**
 * Middleware to validate request using Zod schema
 */
const validate = (schema: ZodSchema): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};

// Pre-configured validators
const validateProposeClosure = validate(proposeClosureSchema);
const validateSoftLock = validate(softLockSchema);
const validateHardLock = validate(hardLockSchema);
const validateRollback = validate(rollbackSchema);
const validateGetSemesterStatus = validate(getSemesterStatusSchema);
const validateGetActivitiesBySemester = validate(getActivitiesBySemesterSchema);

export {
  // Schemas
  proposeClosureSchema,
  softLockSchema,
  hardLockSchema,
  rollbackSchema,
  getSemesterStatusSchema,
  getActivitiesBySemesterSchema,
  
  // Validation middleware
  validate,
  
  // Pre-configured validators
  validateProposeClosure,
  validateSoftLock,
  validateHardLock,
  validateRollback,
  validateGetSemesterStatus,
  validateGetActivitiesBySemester,
};

// CommonJS compatibility
module.exports = {
  proposeClosureSchema,
  softLockSchema,
  hardLockSchema,
  rollbackSchema,
  getSemesterStatusSchema,
  getActivitiesBySemesterSchema,
  validate,
  validateProposeClosure,
  validateSoftLock,
  validateHardLock,
  validateRollback,
  validateGetSemesterStatus,
  validateGetActivitiesBySemester,
};
