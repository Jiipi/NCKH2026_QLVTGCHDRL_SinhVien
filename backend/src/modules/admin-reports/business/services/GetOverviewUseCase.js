const { logInfo, logError } = require('../../../../core/logger');
const { buildSemesterFilter, parseSemesterString } = require('../../../../core/utils/semester');
const { AppError } = require('../../../../core/errors/AppError');

class GetOverviewUseCase {
  constructor(adminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  async execute(query = {}) {
    try {
      const { semester, hoc_ky, nam_hoc } = query;
      let activityWhere = {};

      if (semester) {
        const si = parseSemesterString(semester);
        if (!si) {
          throw new AppError('Tham số học kỳ không hợp lệ', 400);
        }
        activityWhere = buildSemesterFilter(semester, true);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      const [byStatus, topActivities, dailyRegs] = await Promise.all([
        this.repository.groupActivitiesByStatus(activityWhere),
        this.repository.findTopActivities(activityWhere),
        this.repository.groupRegistrationsByDate(activityWhere)
      ]);

      const top = topActivities
        .map(a => ({ id: a.id, ten_hd: a.ten_hd, count: a.dang_ky_hd.length }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 10);

      logInfo('Overview statistics generated', { semester, hoc_ky, nam_hoc });

      return { byStatus, topActivities: top, dailyRegs };
    } catch (error) {
      logError('Error getting overview statistics', error);
      throw error;
    }
  }
}

module.exports = GetOverviewUseCase;

