/**
 * ISemesterRepository
 * Interface for semester data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { HocKy, Prisma } from '@prisma/client';

export interface SemesterOption {
  id: string;
  ten: string;
  namHoc?: string;
  hocKy?: HocKy;
}

export interface ClassDetail {
  id: string;
  ten: string;
  [key: string]: unknown;
}

export interface ClassStudent {
  id: string;
  maSV: string;
  hoTen: string;
  [key: string]: unknown;
}

export interface Activity {
  id: string;
  ten: string;
  [key: string]: unknown;
}

export interface Registration {
  id: string;
  [key: string]: unknown;
}

abstract class ISemesterRepository {
  abstract getSemesterOptions(): Promise<SemesterOption[]>;

  abstract getAllClasses(): Promise<ClassDetail[]>;

  abstract getClassDetail(classId: string): Promise<ClassDetail | null>;

  abstract getClassStudents(classId: string): Promise<ClassStudent[]>;

  abstract getActivitiesBySemester(classId: string, semester: string): Promise<Activity[]>;

  abstract getRegistrationsBySemester(classId: string, semester: string): Promise<Registration[]>;
}

export default ISemesterRepository;
module.exports = ISemesterRepository;
