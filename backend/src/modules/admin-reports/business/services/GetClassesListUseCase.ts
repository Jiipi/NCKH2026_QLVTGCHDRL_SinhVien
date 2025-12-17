/**
 * Get Classes List Use Case
 * Retrieves all classes with student counts
 */
import { logInfo } from '../../../../core/logger';
import type { IAdminReportsRepository, ClassInfo } from '../interfaces/IAdminReportsRepository';

interface FormattedClass {
  id: string;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  soLuongSinhVien: number;
}

class GetClassesListUseCase {
  private repository: IAdminReportsRepository;

  constructor(adminReportsRepository: IAdminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  async execute(): Promise<FormattedClass[]> {
    const classes = (await this.repository.findAllClasses()) as ClassInfo[];

    const formattedClasses: FormattedClass[] = classes.map((cls) => ({
      id: cls.id,
      ten_lop: cls.ten_lop,
      khoa: cls.khoa,
      nien_khoa: cls.nien_khoa,
      soLuongSinhVien: cls._count.sinh_viens,
    }));

    logInfo('Classes list generated', { count: classes.length });

    return formattedClasses;
  }
}

export default GetClassesListUseCase;
module.exports = GetClassesListUseCase;
