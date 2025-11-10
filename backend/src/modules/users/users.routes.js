/**
 * Users Routes - V2 API
 */

const express = require('express');
const router = express.Router();
const { createCRUDRouter } = require('../../shared/factories/crudRouter');
const usersService = require('./users.service');
const auth = require('../../middlewares/auth').auth;
const { asyncHandler } = require('../../shared/errors/AppError');

// ========== Base CRUD Routes (Factory) ==========
const crudRouter = createCRUDRouter({
  resource: 'users',
  service: usersService,
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
 * GET /users/search?q=keyword
 * Search users
 */
router.get('/search', auth, asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Missing search query'
    });
  }
  
  const users = await usersService.search(q, req.user);
  
  res.json({
    success: true,
    data: users
  });
}));

/**
 * GET /users/stats
 * Get user statistics (ADMIN only)
 */
router.get('/stats', auth, asyncHandler(async (req, res) => {
  const stats = await usersService.getStats(req.user);
  
  res.json({
    success: true,
    data: stats
  });
}));

/**
 * GET /users/class/:className
 * Get users by class
 */
router.get('/class/:className', auth, asyncHandler(async (req, res) => {
  const users = await usersService.getByClass(req.params.className, req.user);
  
  res.json({
    success: true,
    data: users
  });
}));

/**
 * GET /users/me
 * Get current user profile
 */
router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await usersService.getById(req.user.id, req.user);
  
  res.json({
    success: true,
    data: user
  });
}));

module.exports = router;
