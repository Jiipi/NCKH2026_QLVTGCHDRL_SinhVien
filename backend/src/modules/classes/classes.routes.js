/**
 * Classes Routes - V2 API
 */

const express = require('express');
const router = express.Router();
const { createCRUDRouter } = require('../../shared/factories/crudRouter');
const classesService = require('./classes.service');
const auth = require('../../middlewares/auth').auth;
const { asyncHandler } = require('../../shared/errors/AppError');

// ========== Base CRUD Routes (Factory) ==========
const crudRouter = createCRUDRouter({
  resource: 'classes',
  service: classesService,
  permissions: {
    list: 'read',
    get: 'read',
    create: 'create',
    update: 'update',
    delete: 'delete'
  }
});

router.use('/', crudRouter);

// ========== Custom Endpoints ==========

/**
 * POST /classes/:id/assign-teacher
 * Gán giảng viên vào lớp (ADMIN only)
 */
router.post('/:id/assign-teacher', auth, asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  
  if (!teacherId) {
    return res.status(400).json({
      success: false,
      message: 'teacherId là bắt buộc'
    });
  }
  
  const result = await classesService.assignTeacher(
    req.params.id,
    teacherId,
    req.user
  );
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * POST /classes/:id/remove-teacher
 * Gỡ giảng viên khỏi lớp (ADMIN only)
 */
router.post('/:id/remove-teacher', auth, asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  
  if (!teacherId) {
    return res.status(400).json({
      success: false,
      message: 'teacherId là bắt buộc'
    });
  }
  
  const result = await classesService.removeTeacher(
    req.params.id,
    teacherId,
    req.user
  );
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * GET /classes/:id/stats
 * Lấy thống kê của class
 */
router.get('/:id/stats', auth, asyncHandler(async (req, res) => {
  const stats = await classesService.getStats(req.params.id, req.user);
  
  res.json({
    success: true,
    data: stats
  });
}));

/**
 * GET /classes/faculty/:faculty
 * Lấy classes theo faculty
 */
router.get('/faculty/:faculty', auth, asyncHandler(async (req, res) => {
  const classes = await classesService.getByFaculty(req.params.faculty, req.user);
  
  res.json({
    success: true,
    data: classes
  });
}));

module.exports = router;
