/**
 * GetRegistrationsBySemesterUseCase
 * Use case for retrieving registrations by semester
 * Follows Single Responsibility Principle (SRP)
 */

import type { DangKyHoatDong, HocKy } from '@prisma/client';
import type ISemesterRepository from '../interfaces/ISemesterRepository';

interface RegistrationWithDetails extends DangKyHoatDong {
  sinh_vien: {
    mssv: string;
    nguoi_dung: { ho_ten: string };
  };
  hoat_dong: {
    ten_hd: string;
    ngay_to_chuc: Date;
    hoc_ky: HocKy;
    nam_hoc: string;
  };
}

class GetRegistrationsBySemesterUseCase {
  private semesterRepository: ISemesterRepository;

  constructor(semesterRepository: ISemesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  /**
   * Execute use case
   * @param classId - Class ID
   * @param semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Registrations list
   */
  async execute(classId: string, semester: string): Promise<RegistrationWithDetails[]> {
    const registrations = await this.semesterRepository.getRegistrationsBySemester(classId, semester);
    return registrations as unknown as RegistrationWithDetails[];
  }
}

export default GetRegistrationsBySemesterUseCase;
module.exports = GetRegistrationsBySemesterUseCase;
