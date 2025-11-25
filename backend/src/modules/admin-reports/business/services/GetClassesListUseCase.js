const { logInfo } = require('../../../../core/logger');

class GetClassesListUseCase {
  constructor(adminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  async execute() {
    const classes = await this.repository.findAllClasses();

    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      ten_lop: cls.ten_lop,
      khoa: cls.khoa,
      nien_khoa: cls.nien_khoa,
      soLuongSinhVien: cls._count.sinh_viens
    }));

    logInfo('Classes list generated', { count: classes.length });

    return formattedClasses;
  }
}

module.exports = GetClassesListUseCase;

