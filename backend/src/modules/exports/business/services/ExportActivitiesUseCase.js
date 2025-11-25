const { parseSemesterString } = require('../../../../core/utils/semester');
const { ValidationError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * ExportActivitiesUseCase
 * Use case for exporting activities to CSV
 * Follows Single Responsibility Principle (SRP)
 */
class ExportActivitiesUseCase {
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

  _safeToIso(d) {
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
  }

  async execute(filters = {}) {
    const { semester, hoc_ky, nam_hoc } = filters;
    
    logInfo('Exporting activities', { semester, hoc_ky, nam_hoc });

    const activityWhere = this._buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

    let rows;
    try {
      rows = await this.exportRepository.findActivitiesForExport(activityWhere, true);
    } catch (qErr) {
      logInfo('Export activities query failed, retrying without orderBy');
      rows = await this.exportRepository.findActivitiesForExport(activityWhere, false);
    }

    const safe = (v) => v === null || v === undefined ? '' : v;

    const headers = ['Ma', 'Ten', 'Loai', 'DiemRL', 'TrangThai', 'NgayBD', 'NgayKT'];
    const data = rows.map(r => [
      safe(r.ma_hd),
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

module.exports = ExportActivitiesUseCase;

