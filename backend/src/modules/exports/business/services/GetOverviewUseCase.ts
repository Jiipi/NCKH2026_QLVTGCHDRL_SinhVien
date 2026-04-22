/**
 * GetOverviewUseCase
 * Use case for getting overview statistics
 * Follows Single Responsibility Principle (SRP)
 */

import { parseSemesterString } from '../../../../core/utils/semester';
import { ValidationError } from '../../../../core/errors/AppError';
import type { HocKy } from '@prisma/client';
import type { IExportRepository, ActivityWhereInput, StatusGroupResult } from '../interfaces/IExportRepository';

interface OverviewFilters {
  semester?: string;
  hoc_ky?: string;
  nam_hoc?: string;
}

interface TopActivityItem {
  id: string;
  ten_hd: string;
  count: number;
}

export interface OverviewResult {
  byStatus: StatusGroupResult[];
  topActivities: TopActivityItem[];
  dailyRegs: unknown[];
}

class GetOverviewUseCase {
  private exportRepository: IExportRepository;

  constructor(exportRepository: IExportRepository) {
    this.exportRepository = exportRepository;
  }

  private _buildActivityWhereFromSemester(
    semester?: string, 
    hoc_ky?: string, 
    nam_hoc?: string
  ): ActivityWhereInput {
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        return {
          hoc_ky: parsed.semester as HocKy,
          nam_hoc: parsed.year
        };
      }
      throw new ValidationError('Tham số học kỳ không hợp lệ');
    } else if (hoc_ky || nam_hoc) {
      return { 
        hoc_ky: hoc_ky ? (hoc_ky as HocKy) : undefined,
        ...(nam_hoc ? { nam_hoc } : {}) 
      };
    }
    return {};
  }

  async execute(filters: OverviewFilters = {}): Promise<OverviewResult> {
    const { semester, hoc_ky, nam_hoc } = filters;
    
    const activityWhere = this._buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

    const [byStatus, topActivities, dailyRegs] = await Promise.all([
      this.exportRepository.groupActivitiesByStatus(activityWhere),
      this.exportRepository.findTopActivities(activityWhere),
      this.exportRepository.groupRegistrationsByDate(activityWhere)
    ]);

    const top: TopActivityItem[] = topActivities
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

export default GetOverviewUseCase;
module.exports = GetOverviewUseCase;
