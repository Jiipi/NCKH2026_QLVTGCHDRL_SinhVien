/**
 * ExportActivitiesUseCase
 * Use case for exporting activities to CSV
 * Follows Single Responsibility Principle (SRP)
 */

import { parseSemesterString } from '../../../../core/utils/semester';
import { ValidationError } from '../../../../core/errors/AppError';
import { logInfo } from '../../../../core/logger';
import type { HocKy } from '@prisma/client';
import type { IExportRepository, ActivityWhereInput, ActivityExportRow } from '../interfaces/IExportRepository';

interface ExportFilters {
  semester?: string;
  hoc_ky?: string;
  nam_hoc?: string;
}

interface IsoDateLike {
  toISOString: () => string;
}

class ExportActivitiesUseCase {
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

  private _safeToIso(d: Date | string | null | undefined): string {
    if (!d) return '';
    try {
      if (typeof d === 'string') {
        const nd = new Date(d);
        return isNaN(nd.getTime()) ? '' : nd.toISOString();
      }
      if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
      if (typeof d === 'object' && d !== null && 'toISOString' in d) {
        return (d as IsoDateLike).toISOString();
      }
      return '';
    } catch { 
      return ''; 
    }
  }

  async execute(filters: ExportFilters = {}): Promise<string> {
    const { semester, hoc_ky, nam_hoc } = filters;
    
    logInfo('Exporting activities', { semester, hoc_ky, nam_hoc });

    const activityWhere = this._buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

    let rows: ActivityExportRow[];
    try {
      rows = await this.exportRepository.findActivitiesForExport(activityWhere, true);
    } catch (qErr) {
      logInfo('Export activities query failed, retrying without orderBy');
      rows = await this.exportRepository.findActivitiesForExport(activityWhere, false);
    }

    const safe = (v: unknown): string => v === null || v === undefined ? '' : String(v);

    const headers = ['Ma', 'Ten', 'Loai', 'DiemRL', 'TrangThai', 'NgayBD', 'NgayKT'];
    const data = rows.map(r => [
      safe(r.ma_hd || `HD${r.id}`),
      safe(r.ten_hd),
      safe(r.loai_hd?.ten_loai_hd),
      safe(r.diem_rl),
      safe(r.trang_thai),
      this._safeToIso(r.ngay_bd),
      this._safeToIso(r.ngay_kt)
    ]);

    const csvRows = data.map(r => 
      r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')
    ).join('\n');

    const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

    return '\uFEFF' + csv; // UTF-8 BOM
  }
}

export default ExportActivitiesUseCase;
module.exports = ExportActivitiesUseCase;
