const { logInfo, logError } = require('../../../../core/logger');
const { buildSemesterFilter, parseSemesterString } = require('../../../../core/utils/semester');
const { AppError } = require('../../../../core/errors/AppError');

class ExportActivitiesUseCase {
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

      const rows = await this.repository.findActivitiesForExport(activityWhere);

      const headers = ['Ma', 'Ten', 'Loai', 'DiemRL', 'TrangThai', 'NgayBD', 'NgayKT'];
      const safeToIso = (d) => {
        if (!d) return '';
        try {
          if (typeof d === 'string') {
            const nd = new Date(d);
            return isNaN(nd.getTime()) ? '' : nd.toISOString();
          }
          if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
          if (typeof d.toISOString === 'function') return d.toISOString();
          return '';
        } catch {
          return '';
        }
      };
      const safe = (v) => (v === null || v === undefined ? '' : v);
      const data = rows.map((r) => [
        safe(r.ma_hd),
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
      logError('Error exporting activities', error);
      throw error;
    }
  }
}

module.exports = ExportActivitiesUseCase;

