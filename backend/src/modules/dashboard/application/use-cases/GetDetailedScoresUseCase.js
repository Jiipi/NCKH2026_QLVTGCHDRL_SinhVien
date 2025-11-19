const DashboardDomainService = require('../../dashboard.service');

/**
 * GetDetailedScoresUseCase
 * Use case for retrieving detailed score breakdown
 */
class GetDetailedScoresUseCase {
  constructor(dashboardRepository) {
    this.dashboardService = new DashboardDomainService(dashboardRepository);
  }

  async execute(userId, query) {
    const data = await this.dashboardService.getStudentDashboard(userId, query);
    return {
      student_info: data.sinh_vien || {},
      summary: data.tong_quan || {},
      criteria_breakdown: data.tien_do_tieu_chi || [],
      activities: data.hoat_dong_gan_day || [],
      class_rankings: data.so_sanh_lop || {}
    };
  }
}

module.exports = GetDetailedScoresUseCase;

