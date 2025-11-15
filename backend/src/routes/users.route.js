const { Router } = require('express');
const { auth: authMiddleware } = require('../core/http/middleware/authJwt');
const { requirePermission } = require('../core/policies');
const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');

// Import V2 modules
const profileV2 = require('../modules/profile');
const usersV2 = require('../modules/users');
const ProfileService = require('../modules/profile/profile.service');
const UsersService = require('../modules/users/users.service');

const router = Router();

// ==================== PUBLIC ROUTES ====================

// U2: Đăng ký tài khoản - Proxy to auth service
router.post('/register', async (req, res) => {
  try {
    // This should be handled by auth service
    // For now, forward to auth routes
    return res.status(400).json({
      success: false,
      message: 'Vui lòng sử dụng endpoint /api/auth/register'
    });
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi đăng ký tài khoản'));
  }
});

// Kiểm tra lớp có lớp trưởng chưa (public)
router.get('/check-class-monitor/:lopId', async (req, res) => {
  try {
    const { lopId } = req.params;
    const result = await ProfileService.checkClassHasMonitor(lopId);
    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi kiểm tra lớp trưởng'));
  }
});

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// U5: Quản lý thông tin cá nhân - Use Profile V2
router.use('/profile', profileV2.routes);

// U21: Quản lý tài khoản người dùng - Use Users V2
// Note: V2 routes already have proper RBAC middleware
router.use('/', usersV2.routes);

module.exports = router;



