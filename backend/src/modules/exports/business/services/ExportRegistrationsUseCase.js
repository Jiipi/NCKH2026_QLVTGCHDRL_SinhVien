const { parseSemesterString } = require('../../../../core/utils/semester');
const { ValidationError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * ExportRegistrationsUseCase
 * Use case for exporting registrations to CSV
 * Follows Single Responsibility Principle (SRP)
 */
class ExportRegistrationsUseCase {
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
    
    logInfo('Exporting registrations', { semester, hoc_ky, nam_hoc });

    const activityWhere = this._buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

    const rows = await this.exportRepository.findRegistrationsForExport(activityWhere);

    const safe = (v) => v === null || v === undefined ? '' : v;

    const headers = ['SinhVien', 'Email', 'HoatDong', 'TrangThai', 'NgayDangKy'];
    const data = rows.map(r => [
      safe(r.sinh_vien?.nguoi_dung?.ho_ten),
      safe(r.sinh_vien?.nguoi_dung?.email),
      safe(r.hoat_dong?.ten_hd),
      safe(r.trang_thai_dk),
      this._safeToIso(r.ngay_dang_ky)
    ]);

    const csvRows = data.map(r => 
      r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')
    ).join('\n');

    const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

    return '\uFEFF' + csv; // UTF-8 BOM
  }
}

module.exports = ExportRegistrationsUseCase;

