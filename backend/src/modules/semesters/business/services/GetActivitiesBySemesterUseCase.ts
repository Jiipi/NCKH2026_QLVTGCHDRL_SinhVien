/**
 * GetActivitiesBySemesterUseCase
 * Use case for retrieving activities by semester
 * Follows Single Responsibility Principle (SRP)
 */

import type { HoatDong, LoaiHoatDong, DangKyHoatDong, HocKy, Prisma } from '@prisma/client';
import { prisma } from '../../../../data/infrastructure/prisma/client';

interface ActivityWithRelations extends HoatDong {
  loai_hd: Pick<LoaiHoatDong, 'ten_loai_hd'> | null;
  dang_ky_hd: Pick<DangKyHoatDong, 'trang_thai_dk' | 'sv_id'>[];
}

class GetActivitiesBySemesterUseCase {
  /**
   * Execute use case
   * @param classId - Class ID
   * @param semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Activities list
   */
  async execute(classId: string, semester: string): Promise<ActivityWithRelations[]> {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where: Prisma.HoatDongWhereInput = { lop_id: classId };
    if (hoc_ky && nam_hoc) {
      where.hoc_ky = hoc_ky as HocKy;
      where.nam_hoc = nam_hoc;
    }

    const activities = await prisma.hoatDong.findMany({
      where,
      include: {
        loai_hd: { select: { ten_loai_hd: true } },
        dang_ky_hd: {
          select: {
            trang_thai_dk: true,
            sv_id: true,
          },
        },
      },
      orderBy: { ngay_bd: 'desc' },
    });

    return activities as unknown as ActivityWithRelations[];
  }
}

export default GetActivitiesBySemesterUseCase;
module.exports = GetActivitiesBySemesterUseCase;
