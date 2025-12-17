/**
 * GetRegistrationsBySemesterUseCase
 * Use case for retrieving registrations by semester
 * Follows Single Responsibility Principle (SRP)
 */

import type { DangKyHoatDong, SinhVien, NguoiDung, HoatDong, HocKy } from '@prisma/client';

const { prisma } = require('../../../../data/infrastructure/prisma/client');

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
  /**
   * Execute use case
   * @param classId - Class ID
   * @param semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns Registrations list
   */
  async execute(classId: string, semester: string): Promise<RegistrationWithDetails[]> {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where: {
      hoat_dong: {
        lop_id: string;
        hoc_ky?: string;
        nam_hoc?: string;
      };
    } = {
      hoat_dong: { lop_id: classId },
    };

    if (hoc_ky && nam_hoc) {
      where.hoat_dong = {
        ...where.hoat_dong,
        hoc_ky,
        nam_hoc,
      };
    }

    const registrations = await prisma.dangKyHoatDong.findMany({
      where,
      include: {
        sinh_vien: {
          select: {
            mssv: true,
            nguoi_dung: { select: { ho_ten: true } },
          },
        },
        hoat_dong: {
          select: {
            ten_hd: true,
            ngay_to_chuc: true,
            hoc_ky: true,
            nam_hoc: true,
          },
        },
      },
      orderBy: { ngay_dang_ky: 'desc' },
    }) as RegistrationWithDetails[];

    return registrations;
  }
}

export default GetRegistrationsBySemesterUseCase;
module.exports = GetRegistrationsBySemesterUseCase;
