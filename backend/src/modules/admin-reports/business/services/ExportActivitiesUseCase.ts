/**
 * Export Activities Use Case
 * Exports activities to CSV
 */
import { logInfo, logError } from '../../../../core/logger';
import { buildSemesterFilter, parseSemesterString } from '../../../../core/utils/semester';
import { AppError } from '../../../../core/errors/AppError';
import type { IAdminReportsRepository } from '../interfaces/IAdminReportsRepository';

interface ExportQuery {
  semester?: string;
  hoc_ky?: string;
  nam_hoc?: string;
}

class ExportActivitiesUseCase {
  private repository: IAdminReportsRepository;

  constructor(adminReportsRepository: IAdminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  async execute(query: ExportQuery = {}): Promise<string> {
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

      const rows = await this.repository.findActivitiesForExport(activityWhere);

      const headers = ['Ma', 'Ten', 'Loai', 'DiemRL', 'TrangThai', 'NgayBD', 'NgayKT'];

      const safeToIso = (d: unknown): string => {
        if (!d) return '';
        try {
          if (typeof d === 'string') {
            const nd = new Date(d);
            return isNaN(nd.getTime()) ? '' : nd.toISOString();
          }
          if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
          if (typeof d === 'object' && d !== null && 'toISOString' in d) {
            return (d as { toISOString: () => string }).toISOString();
          }
          return '';
        } catch {
          return '';
        }
      };

      const safe = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

      const typedRows = rows as Array<{
        id: string;
        ma_hd?: string | null;
        ten_hd: string;
        loai_hd?: { ten_loai_hd: string } | null;
        diem_rl?: number | null;
        trang_thai: string;
        ngay_bd: Date;
        ngay_kt?: Date | null;
      }>;

      const data = typedRows.map((r) => [
        safe(r.ma_hd || `HD${r.id}`),
        safe(r.ten_hd),
        safe(r.loai_hd?.ten_loai_hd),
        safe(r.diem_rl),
        safe(r.trang_thai),
        safeToIso(r.ngay_bd),
        safeToIso(r.ngay_kt),
      ]);

      const csvRows = data
        .map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(','))
        .join('\n');
      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

      logInfo('Activities exported to CSV', { count: rows.length });

      return '\uFEFF' + csv;
    } catch (error) {
      logError('Error exporting activities', error as Error);
      throw error;
    }
  }
}

export default ExportActivitiesUseCase;
module.exports = ExportActivitiesUseCase;
