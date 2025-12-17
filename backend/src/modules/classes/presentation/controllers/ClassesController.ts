import type { Request, Response } from 'express';
import type { Lop } from '@prisma/client';
import type ListClassesDto from '../../business/dto/ListClassesDto';
import type CreateClassDto from '../../business/dto/CreateClassDto';
import type ListClassesUseCase from '../../business/services/ListClassesUseCase';
import type GetClassByIdUseCase from '../../business/services/GetClassByIdUseCase';
import type CreateClassUseCase from '../../business/services/CreateClassUseCase';
import type UpdateClassUseCase from '../../business/services/UpdateClassUseCase';
import type DeleteClassUseCase from '../../business/services/DeleteClassUseCase';
import type AssignTeacherUseCase from '../../business/services/AssignTeacherUseCase';
import type GetClassStudentsUseCase from '../../business/services/GetClassStudentsUseCase';
import type GetClassActivitiesUseCase from '../../business/services/GetClassActivitiesUseCase';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ListClassesDtoModule = require('../../business/dto/ListClassesDto');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CreateClassDtoModule = require('../../business/dto/CreateClassDto');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { logError } = require('../../../../core/logger');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppError } = require('../../../../core/errors/AppError');

/**
 * Authenticated user interface
 */
export interface AuthUser {
  id: number | string;
  role: string;
  class?: string;
}

/**
 * Authenticated request interface
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Use cases interface
 */
export interface ClassUseCases {
  list: ListClassesUseCase;
  getById: GetClassByIdUseCase;
  create: CreateClassUseCase;
  update: UpdateClassUseCase;
  delete: DeleteClassUseCase;
  assignTeacher: AssignTeacherUseCase;
  getStudents: GetClassStudentsUseCase;
  getActivities: GetClassActivitiesUseCase;
}

/**
 * ClassesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ClassesController {
  private useCases: ClassUseCases;

  constructor(useCases: ClassUseCases) {
    this.useCases = useCases;
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const dto: ListClassesDto = ListClassesDtoModule.fromQuery(req.query);
      const result = await this.useCases.list.execute(dto, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách lớp'));
    } catch (error) {
      logError('Get classes error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const classData: Lop = await this.useCases.getById.execute(id, req.user, false);
      return sendResponse(res, 200, ApiResponse.success(classData, 'Thông tin lớp'));
    } catch (error) {
      logError('Get class by ID error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin lớp'));
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const dto: CreateClassDto = CreateClassDtoModule.fromRequest(req.body);
      const result: Lop = await this.useCases.create.execute(dto, req.user);
      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo lớp thành công'));
    } catch (error) {
      logError('Create class error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không tạo được lớp'));
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const result: Lop = await this.useCases.update.execute(id, req.body, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật lớp thành công'));
    } catch (error) {
      logError('Update class error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không cập nhật được lớp'));
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.useCases.delete.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa lớp thành công'));
    } catch (error) {
      logError('Delete class error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không xóa được lớp'));
    }
  }

  async assignTeacher(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { teacherId } = req.body;
      
      if (!teacherId) {
        return sendResponse(res, 400, ApiResponse.validationError([{ message: 'teacherId là bắt buộc' }]));
      }
      
      const result = await this.useCases.assignTeacher.execute(id, teacherId, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Gán giảng viên thành công'));
    } catch (error) {
      logError('Assign teacher error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không gán được giảng viên'));
    }
  }

  async getStudents(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const students = await this.useCases.getStudents.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(students, 'Danh sách sinh viên'));
    } catch (error) {
      logError('Get students error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách sinh viên'));
    }
  }

  async getActivities(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const activities = await this.useCases.getActivities.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(activities, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get class activities error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }
}

export default ClassesController;
module.exports = ClassesController;
