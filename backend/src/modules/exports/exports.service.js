const { logInfo, logError } = require('../../core/logger');
const { parseSemesterString, buildSemesterFilter } = require('../../core/utils/semester');
const exportsRepo = require('./exports.repo');

// Helper function to build activity where clause from semester param
function buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc) {
  if (semester) {
    const parsed = parseSemesterString(semester);
    if (parsed && parsed.year) {
      return {
        hoc_ky: parsed.semester,
        nam_hoc: parsed.year
      };
    }
    throw new Error('INVALID_SEMESTER');
  } else if (hoc_ky || nam_hoc) {
    return { 
      hoc_ky: hoc_ky || undefined, 
      ...(nam_hoc ? { nam_hoc } : {}) 
    };
  }
  return {};
}

class ExportsService {
  /**
   * Get overview statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Overview data
   */
  static async getOverview(filters = {}) {
    try {
      const { semester, hoc_ky, nam_hoc } = filters;
      
      logInfo('Getting overview statistics', { semester, hoc_ky, nam_hoc });

      const activityWhere = buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

      const [byStatus, topActivities, dailyRegs] = await Promise.all([
        // Group by status
        exportsRepo.groupActivitiesByStatus(activityWhere),
        
        // Top activities
        exportsRepo.findTopActivities(activityWhere),
        
        // Daily registrations
        exportsRepo.groupRegistrationsByDate(activityWhere)
      ]);

      // Process top activities
      const top = topActivities
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
    } catch (error) {
      logError('Error getting overview', error);
      throw error;
    }
  }

  /**
   * Export activities to CSV
   * @param {Object} filters - Filter options
   * @returns {Promise<string>} CSV content
   */
  static async exportActivities(filters = {}) {
    try {
      const { semester, hoc_ky, nam_hoc } = filters;
      
      logInfo('Exporting activities', { semester, hoc_ky, nam_hoc });

      const activityWhere = buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

      let rows;
      try {
        rows = await exportsRepo.findActivitiesForExport(activityWhere, true);
      } catch (qErr) {
        logInfo('Export activities query failed, retrying without orderBy');
        rows = await exportsRepo.findActivitiesForExport(activityWhere, false);
      }

      // Helper functions
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

      const safe = (v) => v === null || v === undefined ? '' : v;

      // Build CSV
      const headers = ['Ma', 'Ten', 'Loai', 'DiemRL', 'TrangThai', 'NgayBD', 'NgayKT'];
      const data = rows.map(r => [
        safe(r.ma_hd),
        safe(r.ten_hd),
        safe(r.loai_hd?.ten_loai_hd),
        safe(r.diem_rl),
        safe(r.trang_thai),
        safeToIso(r.ngay_bd),
        safeToIso(r.ngay_kt)
      ]);

      const csvRows = data.map(r => 
        r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')
      ).join('\n');

      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

      return '\uFEFF' + csv; // UTF-8 BOM
    } catch (error) {
      logError('Error exporting activities', error);
      throw error;
    }
  }

  /**
   * Export registrations to CSV
   * @param {Object} filters - Filter options
   * @returns {Promise<string>} CSV content
   */
  static async exportRegistrations(filters = {}) {
    try {
      const { semester, hoc_ky, nam_hoc } = filters;
      
      logInfo('Exporting registrations', { semester, hoc_ky, nam_hoc });

      const activityWhere = buildActivityWhereFromSemester(semester, hoc_ky, nam_hoc);

      const rows = await exportsRepo.findRegistrationsForExport(activityWhere);

      // Helper functions
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

      const safe = (v) => v === null || v === undefined ? '' : v;

      // Build CSV
      const headers = ['SinhVien', 'Email', 'HoatDong', 'TrangThai', 'NgayDangKy'];
      const data = rows.map(r => [
        safe(r.sinh_vien?.nguoi_dung?.ho_ten),
        safe(r.sinh_vien?.nguoi_dung?.email),
        safe(r.hoat_dong?.ten_hd),
        safe(r.trang_thai_dk),
        safeToIso(r.ngay_dang_ky)
      ]);

      const csvRows = data.map(r => 
        r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')
      ).join('\n');

      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

      return '\uFEFF' + csv; // UTF-8 BOM
    } catch (error) {
      logError('Error exporting registrations', error);
      throw error;
    }
  }
}

module.exports = ExportsService;





