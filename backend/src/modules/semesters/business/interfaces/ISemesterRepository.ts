/**
 * ISemesterRepository
 * Interface for semester data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { HocKy, LoaiHoatDong, Prisma } from '@prisma/client';

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

export interface SemesterDistinctRow {
  hoc_ky: HocKy | null;
  nam_hoc: string | null;
}

export interface ClassIdentity {
  id: string;
}

export interface StudentClassIdentity {
  lop_id: string | null;
}

abstract class ISemesterRepository {
  abstract getSemesterOptions(): Promise<SemesterOption[]>;

  abstract getAllClasses(): Promise<ClassDetail[]>;

  abstract getClassDetail(classId: string): Promise<ClassDetail | null>;

  abstract getClassStudents(classId: string): Promise<ClassStudent[]>;

  abstract getActivitiesBySemester(classId: string, semester: string): Promise<Activity[]>;

  abstract getRegistrationsBySemester(classId: string, semester: string): Promise<Registration[]>;

  abstract findSystemActivityType(): Promise<LoaiHoatDong | null>;

  abstract createSystemActivityType(): Promise<LoaiHoatDong>;

  abstract getDistinctSemesters(): Promise<SemesterDistinctRow[]>;

  abstract existsSemesterActivity(hocKy: HocKy, namHoc: string): Promise<boolean>;

  abstract createSemesterSystemActivity(data: {
    hoc_ky: HocKy;
    nam_hoc: string;
    ngay_bd: Date;
    ngay_kt: Date;
    loai_hd_id: string;
    nguoi_tao_id: string;
  }): Promise<void>;

  abstract findClassByMonitorUserId(userId: string): Promise<ClassIdentity | null>;

  abstract findStudentClassByUserId(userId: string): Promise<StudentClassIdentity | null>;
}

export default ISemesterRepository;
module.exports = ISemesterRepository;
