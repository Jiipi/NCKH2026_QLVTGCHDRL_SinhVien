/**
 * Semesters Routes
 * Route definitions for semester management endpoints
 */

const { Router } = require('express');
const { createSemestersController } = require('./presentation/semesters.factory');
const {
  validateProposeClosure,
  validateSoftLock,
  validateHardLock,
  validateRollback,
  validateGetSemesterStatus,
  validateGetActivitiesBySemester,
} = require('./semesters.validators');
const { auth } = require('../../core/http/middleware/authJwt');
const { requirePermission } = require('../../core/policies');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const router = Router();
const semestersController = createSemestersController();

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/semesters/options
 * @desc    Get semester options for UI dropdowns
 * @access  Private
 */
router.get('/options', asyncHandler((req, res) => semestersController.getSemesterOptions(req, res)));

/**
 * @route   GET /api/semesters/list
 * @desc    Get all semesters list (same as options for compatibility)
 * @access  Private
 */
router.get('/list', asyncHandler((req, res) => semestersController.getSemesterOptions(req, res)));

/**
 * @route   GET /api/semesters/current
 * @desc    Get current semester info
 * @access  Private
 */
router.get('/current', asyncHandler((req, res) => semestersController.getCurrentSemester(req, res)));

/**
 * @route   GET /api/semesters/classes
 * @desc    Get all classes for semester management
 * @access  Private
 */
router.get('/classes', asyncHandler((req, res) => semestersController.getAllClasses(req, res)));
router.get('/classes/:classId', asyncHandler((req, res) => semestersController.getClassDetail(req, res)));
router.get('/classes/:classId/students', asyncHandler((req, res) => semestersController.getClassStudents(req, res)));

/**
 * @route   GET /api/semesters/status/:classId/:semester
 * @desc    Get semester closure status
 * @access  Private
 */
router.get(
  '/status/:classId/:semester', 
  validateGetSemesterStatus,
  asyncHandler((req, res) => semestersController.getSemesterStatus(req, res))
);

/**
 * @route   GET /api/semesters/status
 * @desc    Get current semester status (without params)
 * @access  Private
 */
router.get('/status', asyncHandler((req, res) => semestersController.getCurrentSemesterStatus(req, res)));

/**
 * @route   GET /api/semesters/activities/:classId/:semester
 * @desc    Get activities summary for a semester
 * @access  Private
 */
router.get(
  '/activities/:classId/:semester',
  validateGetActivitiesBySemester,
  asyncHandler((req, res) => semestersController.getActivitiesBySemester(req, res))
);

/**
 * @route   GET /api/semesters/registrations/:classId/:semester
 * @desc    Get registrations summary for a semester
 * @access  Private
 */
router.get(
  '/registrations/:classId/:semester',
  validateGetActivitiesBySemester, // Same validation
  asyncHandler((req, res) => semestersController.getRegistrationsBySemester(req, res))
);

/**
 * @route   POST /api/semesters/propose-close
 * @desc    Propose semester closure
 * @access  Private (Admin/Teacher)
 */
router.post(
  '/propose-close',
  requirePermission('create', 'semester'),
  validateProposeClosure,
  asyncHandler((req, res) => semestersController.proposeClosure(req, res))
);

/**
 * @route   POST /api/semesters/soft-lock
 * @desc    Soft lock semester with grace period
 * @access  Private (Admin/Teacher)
 */
router.post(
  '/soft-lock',
  requirePermission('update', 'semester'),
  validateSoftLock,
  asyncHandler((req, res) => semestersController.softLock(req, res))
);

/**
 * @route   POST /api/semesters/hard-lock
 * @desc    Hard lock semester (no modifications allowed)
 * @access  Private (Admin)
 */
router.post(
  '/hard-lock',
  requirePermission('manage', 'semester'),
  validateHardLock,
  asyncHandler((req, res) => semestersController.hardLock(req, res))
);

/**
 * @route   POST /api/semesters/rollback
 * @desc    Rollback semester closure
 * @access  Private (Admin)
 */
router.post(
  '/rollback',
  requirePermission('manage', 'semester'),
  validateRollback,
  asyncHandler((req, res) => semestersController.rollback(req, res))
);

/**
 * @route   POST /api/semesters/create-next
 * @desc    Create next semester automatically
 * @access  Private (Admin) - Role check in controller
 */
router.post('/create-next', asyncHandler((req, res) => semestersController.createNextSemester(req, res)));

/**
 * @route   POST /api/semesters/activate
 * @desc    Activate a semester (locks old, unlocks new)
 * @access  Private (Admin) - Role check in controller
 */
router.post('/activate', asyncHandler((req, res) => semestersController.activateSemester(req, res)));

/**
 * TODO: Add remaining routes from routes/semesters.route.js:
 * - Batch closure operations
 * - Statistics endpoints
 * - Export functionality
 * - Advanced search and filtering
 * 
 * The legacy file has 853 lines with many specialized endpoints.
 * These can be migrated gradually as needed.
 */

module.exports = router;
