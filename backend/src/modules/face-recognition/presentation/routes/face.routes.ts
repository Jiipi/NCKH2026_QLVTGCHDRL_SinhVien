/**
 * Face Recognition Routes
 * ========================
 * API routes cho nhận diện khuôn mặt
 * 
 * Endpoints:
 * - GET  /api/face/health              - Kiểm tra service status
 * - GET  /api/face/status              - Lấy trạng thái đăng ký khuôn mặt
 * - POST /api/face/register            - Đăng ký khuôn mặt (1 hoặc nhiều ảnh)
 * - POST /api/face/attendance/:activityId - Điểm danh bằng khuôn mặt
 * - DELETE /api/face/register          - Xóa dữ liệu khuôn mặt
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { faceRecognitionController } from '../controllers';

// Import auth middleware
import { auth } from '../../../../core/http/middleware';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import { faceLimiter } from '../../../../core/http/middleware/rateLimiters';

const router = Router();

// Multer config cho upload ảnh (lưu trong memory)
// Giảm từ 10MB → 5MB per file để tránh OOM (5 files × 5MB = 25MB max/request)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB per file (khớp với frontend validation)
    files: 5 // Max 5 files for multi-image registration
  },
  fileFilter: (_req, file, cb) => {
    // Chỉ chấp nhận ảnh JPEG/PNG/WebP (không chấp nhận mọi image/*)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh JPEG, PNG hoặc WebP'));
    }
  }
});

// Multer error handler middleware
const handleMulterError = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Tối đa 5 ảnh được phép upload' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Kích thước ảnh tối đa 10MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

/**
 * GET /api/face/health
 * Public endpoint - kiểm tra Face Recognition Service
 */
router.get('/health', (req: Request, res: Response) =>
  faceRecognitionController.healthCheck(req, res)
);

/**
 * GET /api/face/status
 * Requires: authenticated user (sinh viên)
 * Lấy trạng thái đăng ký khuôn mặt
 */
router.get('/status', auth, asyncHandler((req: Request, res: Response) =>
  faceRecognitionController.getFaceStatus(req, res)
));

/**
 * POST /api/face/register
 * Requires: authenticated user (sinh viên)
 * Body: multipart/form-data
 *   - files: Ảnh khuôn mặt (1-5 ảnh, field name: "files")
 *   - file: Ảnh khuôn mặt đơn (backward compatible, field name: "file") 
 *   - updateIfExists: boolean (optional, default false)
 */
router.post('/register', auth, faceLimiter, upload.any(), handleMulterError, asyncHandler((req: any, res: Response) =>
  faceRecognitionController.registerFace(req, res)
));

/**
 * POST /api/face/attendance/:activityId
 * Requires: authenticated user (sinh viên)
 * Body: multipart/form-data
 *   - file: Ảnh khuôn mặt (required)
 *   - threshold: number (optional, default 0.68)
 */
router.post('/attendance/:activityId', auth, faceLimiter, upload.single('file'), asyncHandler((req: any, res: Response) =>
  faceRecognitionController.faceAttendance(req, res)
));

/**
 * DELETE /api/face/register
 * Requires: authenticated user (sinh viên)
 * Xóa dữ liệu khuôn mặt đã đăng ký
 */
router.delete('/register', auth, asyncHandler((req: any, res: Response) =>
  faceRecognitionController.deleteFaceData(req, res)
));

export default router;
