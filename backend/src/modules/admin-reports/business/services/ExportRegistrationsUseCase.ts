/**
 * Export Registrations Use Case
 * Exports registrations to CSV
 */
import { logInfo, logError } from '../../../../core/logger';
import { buildSemesterFilter, parseSemesterString } from '../../../../core/utils/semester';
import { AppError } from '../../../../core/errors/AppError';
import type { IAdminReportsRepository } from '../interfaces/IAdminReportsRepository';
import type { RegistrationExportData } from '../../admin-reports.types';

interface ExportQuery {
  semester?: string;
  hoc_ky?: string;
  nam_hoc?: string;
}

class ExportRegistrationsUseCase {
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
        activityWhere = buildSemesterFilter(semester, false);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      const rows = await this.repository.findRegistrationsForExport(activityWhere);

      const headers = ['SinhVien', 'Email', 'HoatDong', 'TrangThai', 'NgayDangKy'];

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

      const typedRows = rows as RegistrationExportData[];
      const data = typedRows.map((r) => [
        safe(r.sinh_vien?.nguoi_dung?.ho_ten),
        safe(r.sinh_vien?.nguoi_dung?.email),
        safe(r.hoat_dong?.ten_hd),
        safe(r.trang_thai_dk),
        safeToIso(r.ngay_dang_ky),
      ]);

      const csvRows = data
        .map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(','))
        .join('\n');
      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

      logInfo('Registrations exported to CSV', { count: rows.length });

      return '\uFEFF' + csv;
    } catch (error) {
      logError('Error exporting registrations', error as Error);
      throw error;
    }
  }
}

export default ExportRegistrationsUseCase;
module.exports = ExportRegistrationsUseCase;
