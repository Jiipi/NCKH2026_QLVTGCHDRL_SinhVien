import { Router, Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { auditIntegrityService } from '../../services/auditIntegrity.service';

const router = Router();

router.get('/verify', async (req: Request, res: Response): Promise<Response> => {
  try {
    const scope = typeof req.query.scope === 'string' && req.query.scope.trim()
      ? req.query.scope.trim()
      : undefined;
    const result = await auditIntegrityService.verifyChain(scope);
    return sendResponse(res, 200, ApiResponse.success(result, result.valid ? 'Dữ liệu toàn vẹn' : 'Phát hiện dấu hiệu dữ liệu bị thay đổi'));
  } catch (error) {
    logError('Audit integrity verify error', error as Error);
    return sendResponse(res, 500, ApiResponse.error('Không thể kiểm tra toàn vẹn dữ liệu'));
  }
});

export default router;
