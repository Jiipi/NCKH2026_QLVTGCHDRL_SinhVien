const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetFilterOptionsUseCase
 * Use case for getting filter options (semesters and academic years)
 * Follows Single Responsibility Principle (SRP)
 */
class GetFilterOptionsUseCase {
  constructor(pointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId) {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const [semesters, academicYears] = await Promise.all([
      this.pointsRepository.getUniqueSemesters(sinhVien.id),
      this.pointsRepository.getUniqueAcademicYears(sinhVien.id)
    ]);

    const hocKyOptions = semesters.map(hocKy => ({
      value: hocKy,
      label: hocKy === 'hoc_ky_1' ? 'Học kỳ I' : 'Học kỳ II'
    }));

    const namHocOptions = academicYears.map(namHoc => ({
      value: namHoc,
      label: namHoc
    }));

    return {
      hoc_ky: hocKyOptions,
      nam_hoc: namHocOptions
    };
  }
}

module.exports = GetFilterOptionsUseCase;

