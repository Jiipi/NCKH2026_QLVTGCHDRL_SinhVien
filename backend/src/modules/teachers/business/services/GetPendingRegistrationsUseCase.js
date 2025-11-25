const { ForbiddenError } = require('../../../../core/errors/AppError');
const ListRegistrationsDto = require('../../../registrations/business/dto/ListRegistrationsDto');

/**
 * GetPendingRegistrationsUseCase
 * Use case for getting pending registrations
 * Follows Single Responsibility Principle (SRP)
 */
class GetPendingRegistrationsUseCase {
  constructor(getAllRegistrationsUseCase, listRegistrationsUseCase) {
    this.getAllRegistrationsUseCase = getAllRegistrationsUseCase;
    this.listRegistrationsUseCase = listRegistrationsUseCase;
  }

  async execute(user, options = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { page, limit, classId, semester, status } = options;
    
    if (classId || semester) {
      const registrations = await this.getAllRegistrationsUseCase.execute(user, {
        status: status || 'cho_duyet',
        semester,
        classId
      });
      
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const startIdx = (pageNum - 1) * limitNum;
      const endIdx = startIdx + limitNum;
      
      return {
        items: registrations.slice(startIdx, endIdx),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: registrations.length,
          totalPages: Math.ceil(registrations.length / limitNum)
        }
      };
    }
    
    // Use ListRegistrationsUseCase
    const dto = new ListRegistrationsDto({
      status: 'cho_duyet',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    return await this.listRegistrationsUseCase.execute(dto, user);
  }
}

module.exports = GetPendingRegistrationsUseCase;

