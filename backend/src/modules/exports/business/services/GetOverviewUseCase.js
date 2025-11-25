const { parseSemesterString } = require('../../../../core/utils/semester');
const { ValidationError } = require('../../../../core/errors/AppError');

/**
 * GetOverviewUseCase
 * Use case for getting overview statistics
 * Follows Single Responsibility Principle (SRP)
 */
class GetOverviewUseCase {
  constructor(exportRepository) {
    this.exportRepository = exportRepository;
  }

  _buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc) {
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        return {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        };
      }
      throw new ValidationError('Tham số học kỳ không hợp lệ');
    } else if (hoc_ky || nam_hoc) {
      return { 
        hoc_ky: hoc_ky || undefined, 
        ...(nam_hoc ? { nam_hoc } : {}) 
      };
    }
    return {};
  }

  async execute(filters = {}) {
    const { semester, hoc_ky, nam_hoc } = filters;
    
    const activityWhere = this._buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

    const [byStatus, topActivities, dailyRegs] = await Promise.all([
      this.exportRepository.groupActivitiesByStatus(activityWhere),
      this.exportRepository.findTopActivities(activityWhere),
      this.exportRepository.groupRegistrationsByDate(activityWhere)
    ]);

    const top = topActivities
      .map(a => ({ 
        id: a.id, 
        ten_hd: a.ten_hd, 
        count: a.dang_ky_hd.length 
      }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 10);

    return { 
      byStatus, 
      topActivities: top, 
      dailyRegs 
    };
  }
}

module.exports = GetOverviewUseCase;

