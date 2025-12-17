/**
 * Get Overview Use Case
 * Retrieves overview statistics for admin dashboard
 */
import { logInfo, logError } from '../../../../core/logger';
import { buildSemesterFilter, parseSemesterString } from '../../../../core/utils/semester';
import { AppError } from '../../../../core/errors/AppError';
import type { IAdminReportsRepository } from '../interfaces/IAdminReportsRepository';

interface OverviewQuery {
  semester?: string;
  hoc_ky?: string;
  nam_hoc?: string;
}

interface TopActivityResult {
  id: number;
  ten_hd: string;
  count: number;
}

interface OverviewResult {
  byStatus: Array<{
    trang_thai: string;
    _count: { _all: number };
  }>;
  topActivities: TopActivityResult[];
  dailyRegs: Array<{
    ngay_dang_ky: Date;
    _count: { _all: number };
  }>;
}

class GetOverviewUseCase {
  private repository: IAdminReportsRepository;

  constructor(adminReportsRepository: IAdminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  async execute(query: OverviewQuery = {}): Promise<OverviewResult> {
    try {
      const { semester, hoc_ky, nam_hoc } = query;
      let activityWhere: Record<string, unknown> = {};

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
        this.repository.groupRegistrationsByDate(activityWhere),
      ]);

      const topData = topActivities as Array<{ id: string; ten_hd: string; dang_ky_hd?: Array<{ id: string }> }>;
      const top: TopActivityResult[] = topData
        .map((a) => ({
          id: Number(a.id) || 0,
          ten_hd: a.ten_hd,
          count: a.dang_ky_hd?.length || 0,
        }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 10);

      logInfo('Overview statistics generated', { semester, hoc_ky, nam_hoc });

      return {
        byStatus: byStatus as Array<{ trang_thai: string; _count: { _all: number } }>,
        topActivities: top,
        dailyRegs: dailyRegs as Array<{ ngay_dang_ky: Date; _count: { _all: number } }>,
      };
    } catch (error) {
      logError('Error getting overview statistics', error as Error);
      throw error;
    }
  }
}

export default GetOverviewUseCase;
module.exports = GetOverviewUseCase;
