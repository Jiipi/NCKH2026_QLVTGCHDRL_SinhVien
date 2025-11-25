/**
 * GetRegistrationsBySemesterUseCase
 * Use case for retrieving registrations by semester
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

class GetRegistrationsBySemesterUseCase {
  /**
   * Execute use case
   * @param {string} classId - Class ID
   * @param {string} semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns {Promise<Array>} Registrations list
   */
  async execute(classId, semester) {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where = {
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
    });

    return registrations;
  }
}

module.exports = GetRegistrationsBySemesterUseCase;

