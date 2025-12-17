/**
 * Users Route
 * API endpoints for user management and profile
 * @module presentation/routes/users
 */

import { Router, Request, Response } from 'express';
import { auth as authMiddleware } from '../../core/http/middleware/authJwt';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';

// Import V2 modules
import * as profileV2 from '../../modules/profile';
import * as usersV2 from '../../modules/users';
import profileRepository from '../../modules/profile/data/repositories/profile.repository';
import CheckClassHasMonitorUseCase from '../../modules/profile/business/services/CheckClassHasMonitorUseCase';

// Initialize use case
const checkClassHasMonitorUseCase = new CheckClassHasMonitorUseCase(profileRepository);

const router = Router();

// ==================== PUBLIC ROUTES ====================

// U2: Đăng ký tài khoản - Proxy to auth service
router.post('/register', async (req: Request, res: Response) => {
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
router.get('/check-class-monitor/:lopId', async (req: Request, res: Response) => {
  try {
    const { lopId } = req.params;
    const result = await checkClassHasMonitorUseCase.execute(lopId);
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

export default router;
