/**
 * Semesters Module Validators
 * Zod schemas for semester operations input validation
 */

const { z } = require('zod');

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
const validate = (schema) => {
  return (req, res, next) => {
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
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};

module.exports = {
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
  validateProposeClosure: validate(proposeClosureSchema),
  validateSoftLock: validate(softLockSchema),
  validateHardLock: validate(hardLockSchema),
  validateRollback: validate(rollbackSchema),
  validateGetSemesterStatus: validate(getSemesterStatusSchema),
  validateGetActivitiesBySemester: validate(getActivitiesBySemesterSchema),
};
