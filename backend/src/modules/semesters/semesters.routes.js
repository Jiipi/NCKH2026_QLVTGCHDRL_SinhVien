/**
 * Semesters Routes
 * Route definitions for semester management endpoints
 */

const { Router } = require('express');
const SemestersController = require('./semesters.controller');
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

const router = Router();

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/semesters/options
 * @desc    Get semester options for UI dropdowns
 * @access  Private
 */
router.get('/options', SemestersController.getSemesterOptions);

/**
 * @route   GET /api/semesters/list
 * @desc    Get all semesters list (same as options for compatibility)
 * @access  Private
 */
router.get('/list', SemestersController.getSemesterOptions);

/**
 * @route   GET /api/semesters/current
 * @desc    Get current semester info
 * @access  Private
 */
router.get('/current', SemestersController.getCurrentSemester);

/**
 * @route   GET /api/semesters/classes
 * @desc    Get all classes for semester management
 * @access  Private
 */
router.get('/classes', SemestersController.getAllClasses);
router.get('/classes/:classId', SemestersController.getClassDetail);
router.get('/classes/:classId/students', SemestersController.getClassStudents);

/**
 * @route   GET /api/semesters/status/:classId/:semester
 * @desc    Get semester closure status
 * @access  Private
 */
router.get(
  '/status/:classId/:semester', 
  validateGetSemesterStatus,
  SemestersController.getSemesterStatus
);

/**
 * @route   GET /api/semesters/status
 * @desc    Get current semester status (without params)
 * @access  Private
 */
router.get('/status', SemestersController.getCurrentSemesterStatus);

/**
 * @route   GET /api/semesters/activities/:classId/:semester
 * @desc    Get activities summary for a semester
 * @access  Private
 */
router.get(
  '/activities/:classId/:semester',
  validateGetActivitiesBySemester,
  SemestersController.getActivitiesBySemester
);

/**
 * @route   GET /api/semesters/registrations/:classId/:semester
 * @desc    Get registrations summary for a semester
 * @access  Private
 */
router.get(
  '/registrations/:classId/:semester',
  validateGetActivitiesBySemester, // Same validation
  SemestersController.getRegistrationsBySemester
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
  SemestersController.proposeClosure
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
  SemestersController.softLock
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
  SemestersController.hardLock
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
  SemestersController.rollback
);

/**
 * @route   POST /api/semesters/create-next
 * @desc    Create next semester automatically
 * @access  Private (Admin) - Role check in controller
 */
router.post('/create-next', SemestersController.createNextSemester);

/**
 * @route   POST /api/semesters/activate
 * @desc    Activate a semester (locks old, unlocks new)
 * @access  Private (Admin) - Role check in controller
 */
router.post('/activate', SemestersController.activateSemester);

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
