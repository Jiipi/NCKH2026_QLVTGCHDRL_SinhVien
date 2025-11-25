/**
 * GetActivitiesBySemesterUseCase
 * Use case for retrieving activities by semester
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

class GetActivitiesBySemesterUseCase {
  /**
   * Execute use case
   * @param {string} classId - Class ID
   * @param {string} semester - Semester string (e.g., 'hoc_ky_1-2025')
   * @returns {Promise<Array>} Activities list
   */
  async execute(classId, semester) {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where = { lop_id: classId };
    if (hoc_ky && nam_hoc) {
      where.hoc_ky = hoc_ky;
      where.nam_hoc = nam_hoc;
    }

    const activities = await prisma.hoatDong.findMany({
      where,
      include: {
        loai_hoat_dong: { select: { ten_loai_hd: true } },
        dang_ky: {
          select: {
            trang_thai: true,
            sinh_vien_id: true,
          },
        },
      },
      orderBy: { ngay_to_chuc: 'desc' },
    });

    return activities;
  }
}

module.exports = GetActivitiesBySemesterUseCase;

