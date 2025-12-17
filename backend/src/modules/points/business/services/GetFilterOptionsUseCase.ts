/**
 * GetFilterOptionsUseCase
 * Use case for getting filter options (semesters and academic years)
 */
import { NotFoundError } from '../../../../core/errors/AppError';
import type { IPointsRepository } from '../interfaces/IPointsRepository';

interface FilterOption {
  value: string | null;
  label: string;
}

interface FilterOptionsResult {
  hoc_ky: FilterOption[];
  nam_hoc: FilterOption[];
}

class GetFilterOptionsUseCase {
  private pointsRepository: IPointsRepository;

  constructor(pointsRepository: IPointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId: string): Promise<FilterOptionsResult> {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const [semesters, academicYears] = await Promise.all([
      this.pointsRepository.getUniqueSemesters(sinhVien.id),
      this.pointsRepository.getUniqueAcademicYears(sinhVien.id),
    ]);

    const hocKyOptions: FilterOption[] = semesters.map((hocKy) => ({
      value: hocKy,
      label: hocKy === 'hoc_ky_1' ? 'Học kỳ I' : 'Học kỳ II',
    }));

    const namHocOptions: FilterOption[] = academicYears
      .filter((namHoc): namHoc is string => namHoc !== null)
      .map((namHoc) => ({
        value: namHoc,
        label: namHoc,
      }));

    return {
      hoc_ky: hocKyOptions,
      nam_hoc: namHocOptions,
    };
  }
}

export default GetFilterOptionsUseCase;
module.exports = GetFilterOptionsUseCase;
