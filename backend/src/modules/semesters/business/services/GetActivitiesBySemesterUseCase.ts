/**
 * GetActivitiesBySemesterUseCase
 * Use case for retrieving activities by semester
 * Follows Single Responsibility Principle (SRP)
 */

import type { HoatDong, LoaiHoatDong, DangKyHoatDong } from '@prisma/client';
import type ISemesterRepository from '../interfaces/ISemesterRepository';

interface ActivityWithRelations extends HoatDong {
  loai_hd: Pick<LoaiHoatDong, 'ten_loai_hd'> | null;
  dang_ky_hd: Pick<DangKyHoatDong, 'trang_thai_dk' | 'sv_id'>[];
}

class GetActivitiesBySemesterUseCase {
  private semesterRepository: ISemesterRepository;

  constructor(semesterRepository: ISemesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  /**
   * Execute use case
   * @param classId - Class ID
   * @param semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Activities list
   */
  async execute(classId: string, semester: string): Promise<ActivityWithRelations[]> {
    const activities = await this.semesterRepository.getActivitiesBySemester(classId, semester);
    return activities as unknown as ActivityWithRelations[];
  }
}

export default GetActivitiesBySemesterUseCase;
module.exports = GetActivitiesBySemesterUseCase;
