/**
 * GetPendingRegistrationsUseCase
 * Use case for getting pending registrations
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import { ListRegistrationsDto } from '../../../registrations/business/dto/ListRegistrationsDto';
import type GetAllRegistrationsUseCase from './GetAllRegistrationsUseCase';
import type { ListRegistrationsUseCase } from '../../../registrations/business/services/ListRegistrationsUseCase';
import type { ClassRegistration } from '../../teachers.types';
import type { ListRegistrationsResult, PaginationInfo } from '../../../registrations/business/services/ListRegistrationsUseCase';
import type { AuthUser } from '../../../registrations/business/helpers/registrationAccess';

export interface PendingRegistrationsUser {
  sub?: string;
  id?: string;
  role: string;
}

export interface PendingRegistrationsOptions {
  page?: string | number;
  limit?: string | number;
  classId?: string;
  semester?: string;
  status?: string;
}

export interface PendingRegistrationsResult {
  items: ClassRegistration[];
  pagination: PaginationInfo;
}

class GetPendingRegistrationsUseCase {
  private getAllRegistrationsUseCase: GetAllRegistrationsUseCase;
  private listRegistrationsUseCase: ListRegistrationsUseCase;

  constructor(
    getAllRegistrationsUseCase: GetAllRegistrationsUseCase,
    listRegistrationsUseCase: ListRegistrationsUseCase
  ) {
    this.getAllRegistrationsUseCase = getAllRegistrationsUseCase;
    this.listRegistrationsUseCase = listRegistrationsUseCase;
  }

  async execute(user: PendingRegistrationsUser, options: PendingRegistrationsOptions = {}): Promise<PendingRegistrationsResult> {
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
      
      const pageNum = parseInt(String(page)) || 1;
      const limitNum = parseInt(String(limit)) || 20;
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
      page: parseInt(String(page)) || 1,
      limit: parseInt(String(limit)) || 20,
      includeApprover: true
    });

    const authUser: AuthUser = {
      sub: user.sub || user.id || '',
      role: user.role,
      id: user.id,
    };
    
    const result = await this.listRegistrationsUseCase.execute<ClassRegistration>(dto, authUser) as ListRegistrationsResult<ClassRegistration>;
    return {
      items: result.data || [],
      pagination: result.pagination || {
        page: dto.page,
        limit: dto.limit,
        total: (result.data || []).length,
        totalPages: 1
      }
    };
  }
}

export default GetPendingRegistrationsUseCase;
