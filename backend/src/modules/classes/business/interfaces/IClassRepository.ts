import type { Lop, SinhVien, NguoiDung, HoatDong } from '@prisma/client';

/**
 * Include options for class queries
 */
export interface ClassIncludeOptions {
  students?: boolean;
  teachers?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Find many options
 */
export interface FindManyOptions {
  where?: Record<string, unknown>;
  skip?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Find many result
 */
export interface FindManyResult<T> {
  items: T[];
  total: number;
}

/**
 * Class stats
 */
export interface ClassStats {
  totalStudents: number;
  totalActivities: number;
  totalTeachers?: number;
}

/**
 * Student with user info
 */
export interface StudentWithUser {
  id: number;
  mssv: string;
  nguoi_dung?: {
    id: number;
    ho_ten: string;
    email: string;
  };
}

/**
 * IClassRepository
 * Interface for class data access
 * Follows Dependency Inversion Principle (DIP)
 */
abstract class IClassRepository {
  async findMany(_options: FindManyOptions): Promise<FindManyResult<Lop & { total_sinh_vien?: number }>> {
    throw new Error('Method findMany must be implemented');
  }

  async findById(_id: string | number, _include?: ClassIncludeOptions): Promise<Lop | null> {
    throw new Error('Method findById must be implemented');
  }

  async findByName(_name: string): Promise<Lop | null> {
    throw new Error('Method findByName must be implemented');
  }

  async create(_data: Partial<Lop>): Promise<Lop> {
    throw new Error('Method create must be implemented');
  }

  async update(_id: string | number, _data: Partial<Lop>): Promise<Lop> {
    throw new Error('Method update must be implemented');
  }

  async delete(_id: string | number): Promise<Lop> {
    throw new Error('Method delete must be implemented');
  }

  async exists(_id: string | number): Promise<boolean> {
    throw new Error('Method exists must be implemented');
  }

  async findByFaculty(_faculty: string): Promise<Lop[]> {
    throw new Error('Method findByFaculty must be implemented');
  }

  async assignTeacher(_classId: string | number, _teacherId: string | number): Promise<Lop> {
    throw new Error('Method assignTeacher must be implemented');
  }

  async removeTeacher(_classId: string | number, _teacherId: string | number): Promise<Lop> {
    throw new Error('Method removeTeacher must be implemented');
  }

  async getStats(_classId: string | number): Promise<ClassStats | null> {
    throw new Error('Method getStats must be implemented');
  }

  async getStudents(_classId: string | number): Promise<StudentWithUser[]> {
    throw new Error('Method getStudents must be implemented');
  }

  async getActivities(_classId: string | number): Promise<HoatDong[]> {
    throw new Error('Method getActivities must be implemented');
  }
}

export default IClassRepository;
module.exports = IClassRepository;
