/**
 * Semesters Service
 * Business logic for semester management and closure
 */

const { prisma } = require('../../infrastructure/prisma/client');
const SemesterClosure = require('../../services/semesterClosure.service');
const { determineSemesterFromDate } = require('../../core/utils/semester');
const { logInfo, logError } = require('../../core/logger');
const { AppError } = require('../../core/errors/AppError');

class SemestersService {
  /**
   * Get semester options from database activities
   */
  static async getSemesterOptions() {
    // Read metadata to determine currently active semester (normalized dash format e.g. hoc_ky_1-2025)
    let activeSemester = null;
    try {
      const fs = require('fs');
      const path = require('path');
      const metadataPath = path.join(process.cwd(), 'data', 'semesters', 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (metadata && metadata.active_semester) {
          activeSemester = metadata.active_semester; // already dash format
        }
      }
    } catch (e) {
      // ignore metadata read errors
    }

    const rows = await prisma.hoatDong.findMany({
      select: { hoc_ky: true, nam_hoc: true },
      distinct: ['hoc_ky', 'nam_hoc'],
    });

    const seen = new Set();
    const opts = rows
      .filter((r) => r.hoc_ky && r.nam_hoc)
      .map((r) => {
        // Extract semester number from hoc_ky (hoc_ky_1 → 1, hoc_ky_2 → 2)
        const semesterNum = r.hoc_ky === 'hoc_ky_1' ? '1' : r.hoc_ky === 'hoc_ky_2' ? '2' : r.hoc_ky;

        // Parse academic year (2025-2026)
        const yearMatch = r.nam_hoc.match(/(\d{4})-(\d{4})/);
        const year = yearMatch ? yearMatch[1] : r.nam_hoc;

        // Value should use dash format to align with activation & UI parsing logic (hoc_ky_1-2025)
        const value = `${r.hoc_ky}-${year}`;
        const label = `HK${semesterNum}_${year} (${r.nam_hoc})`;

        // Prevent duplicates if multiple activities share same hoc_ky/nam_hoc
        if (seen.has(value)) return null;
        seen.add(value);

        const isActive = activeSemester === value;
        return {
          value,
          label,
          is_active: isActive,
          status: isActive ? 'ACTIVE' : null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value.localeCompare(a.value));

    return opts;
  }

  /**
   * Get current semester info
   */
  static getCurrentSemester() {
    return SemesterClosure.getCurrentSemesterInfo();
  }

  /**
   * Get semester status for a class
   */
  static getSemesterStatus(classId, semester) {
    return SemesterClosure.getStatus(classId, semester);
  }

  /**
   * Propose semester closure
   */
  static async proposeClosure(classId, actorId, semesterStr) {
    const state = await SemesterClosure.proposeClose({ 
      classId, 
      actorId, 
      semesterStr 
    });
    
    logInfo('Semester closure proposed', { classId, semesterStr, actorId });
    return state;
  }

  /**
   * Soft lock semester
   */
  static async softLock(classId, actorId, semesterStr, graceHours = 72) {
    const state = await SemesterClosure.softLock({ 
      classId, 
      actorId, 
      semesterStr, 
      graceHours 
    });
    
    logInfo('Semester soft locked', { classId, semesterStr, graceHours });
    return state;
  }

  /**
   * Hard lock semester
   */
  static async hardLock(classId, actorId, semesterStr) {
    const state = await SemesterClosure.hardLock({ 
      classId, 
      actorId, 
      semesterStr 
    });
    
    logInfo('Semester hard locked', { classId, semesterStr });
    return state;
  }

  /**
   * Rollback semester closure
   */
  static async rollback(classId, actorId, semesterStr) {
    const state = await SemesterClosure.rollback({ 
      classId, 
      actorId, 
      semesterStr 
    });
    
    logInfo('Semester closure rolled back', { classId, semesterStr });
    return state;
  }

  /**
   * Get all classes
   */
  static async getAllClasses() {
    return await prisma.lop.findMany({
      select: {
        id: true,
        ten_lop: true,
        khoa: true,
        nien_khoa: true,
      },
      orderBy: { ten_lop: 'asc' },
    });
  }

  /**
   * Ensure system activity type exists
   */
  static async ensureSystemActivityTypeId() {
    const existing = await prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: { in: ['Hệ thống', 'He thong', 'System', 'SYSTEM'] } },
      select: { id: true }
    });
    
    if (existing?.id) return existing.id;

    const anyType = await prisma.loaiHoatDong.findFirst({ select: { id: true } });
    if (anyType?.id) return anyType.id;

    const created = await prisma.loaiHoatDong.create({
      data: {
        ten_loai_hd: 'Hệ thống',
        mo_ta: 'Loại hoạt động mặc định cho các bản ghi hệ thống'
      },
      select: { id: true }
    });
    
    return created.id;
  }

  /**
   * Get activities summary by semester
   */
  static async getActivitiesBySemester(classId, semester) {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where = { lop_id: classId };
    if (hoc_ky && nam_hoc) {
      where.hoc_ky = hoc_ky;
      where.nam_hoc = nam_hoc;
    }

    const activities = await prisma.hoatDong.findMany({
      where,
      include: {
        loai_hoat_dong: { select: { ten_loai_hd: true } },
        dang_ky: {
          select: {
            trang_thai: true,
            sinh_vien_id: true,
          },
        },
      },
      orderBy: { ngay_to_chuc: 'desc' },
    });

    return activities;
  }

  /**
   * Get registrations summary by semester
   */
  static async getRegistrationsBySemester(classId, semester) {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where = {
      hoat_dong: { lop_id: classId },
    };

    if (hoc_ky && nam_hoc) {
      where.hoat_dong = {
        ...where.hoat_dong,
        hoc_ky,
        nam_hoc,
      };
    }

    const registrations = await prisma.dangKyHoatDong.findMany({
      where,
      include: {
        sinh_vien: {
          select: {
            mssv: true,
            nguoi_dung: { select: { ho_ten: true } },
          },
        },
        hoat_dong: {
          select: {
            ten_hd: true,
            ngay_to_chuc: true,
            hoc_ky: true,
            nam_hoc: true,
          },
        },
      },
      orderBy: { ngay_dang_ky: 'desc' },
    });

    return registrations;
  }

  /**
   * Create next semester automatically
   * HK1 (2025-2026) → HK2 (2025-2026)
   * HK2 (2025-2026) → HK1 (2026-2027)
   */
  static async createNextSemester(user) {
    const { prisma } = require('../../infrastructure/prisma/client');
    
    // Get latest semester from database
    const rows = await prisma.hoatDong.findMany({
      select: { hoc_ky: true, nam_hoc: true },
      distinct: ['hoc_ky', 'nam_hoc'],
      where: {
        nam_hoc: { not: null },
      },
    });

    // Filter valid semesters (format: YYYY-YYYY)
    const valid = rows.filter(r => /(\d{4})-(\d{4})/.test(r.nam_hoc || ''));
    
    let latestSemester = null;
    if (valid.length > 0) {
      // Sort by year and semester
      const withIndex = valid.map(r => {
        const [, y1, y2] = (r.nam_hoc || '').match(/(\d{4})-(\d{4})/);
        const baseYear = r.hoc_ky === 'hoc_ky_1' ? parseInt(y1) : parseInt(y2);
        const idx = baseYear * 2 + (r.hoc_ky === 'hoc_ky_2' ? 1 : 0);
        return { ...r, idx };
      });
      withIndex.sort((a, b) => b.idx - a.idx);
      latestSemester = { hoc_ky: withIndex[0].hoc_ky, nam_hoc: withIndex[0].nam_hoc };
    }

    // If no data, create HK1 of current year
    if (!latestSemester) {
      const currentYear = new Date().getFullYear();
      const newHocKy = 'hoc_ky_1';
      const newNamHoc = `${currentYear}-${currentYear + 1}`;
      
      await prisma.hoatDong.create({
        data: {
          ten_hd: `[SYSTEM] Học kỳ 1 năm học ${newNamHoc}`,
          mo_ta: 'Hoạt động hệ thống để đánh dấu học kỳ mới',
          hoc_ky: newHocKy,
          nam_hoc: newNamHoc,
          ngay_bd: new Date(`${currentYear}-09-01`),
          ngay_kt: new Date(`${currentYear + 1}-01-01`),
          ngay_tao: new Date(),
          loai_hd_id: 'SYSTEM',
          nguoi_tao_id: user?.sub || 'admin',
          trang_thai: 'da_duyet',
        },
      });
      
      return {
        success: true,
        message: `Đã tạo học kỳ mới: HK1 (${newNamHoc})`,
        data: {
          hoc_ky: newHocKy,
          nam_hoc: newNamHoc,
          display: `HK1_${currentYear} (${newNamHoc})`,
        },
      };
    }
    
    // Calculate next semester
    const currentHocKy = latestSemester.hoc_ky;
    const yearMatch = (latestSemester.nam_hoc || '').match(/(\d{4})-(\d{4})/);
    
    let newHocKy, newNamHoc, newYear, startDate, endDate;
    
    if (currentHocKy === 'hoc_ky_1') {
      // HK1 → HK2 (same academic year)
      newHocKy = 'hoc_ky_2';
      if (yearMatch) {
        const [_, year1, year2] = yearMatch;
        newNamHoc = latestSemester.nam_hoc;
        newYear = parseInt(year2);
        startDate = new Date(`${year2}-02-01`);
        endDate = new Date(`${year2}-06-30`);
      }
    } else {
      // HK2 → HK1 (next academic year)
      newHocKy = 'hoc_ky_1';
      if (yearMatch) {
        const [_, year1, year2] = yearMatch;
        const nextYear1 = parseInt(year2);
        const nextYear2 = nextYear1 + 1;
        newYear = nextYear1;
        newNamHoc = `${nextYear1}-${nextYear2}`;
        startDate = new Date(`${nextYear1}-09-01`);
        endDate = new Date(`${nextYear2}-01-31`);
      }
    }
    
    // Check if semester already exists
    const existing = await prisma.hoatDong.findFirst({
      where: {
        hoc_ky: newHocKy,
        nam_hoc: newNamHoc,
      },
    });
    
    if (existing) {
      return {
        success: false,
        message: `Học kỳ ${newHocKy === 'hoc_ky_1' ? 'HK1' : 'HK2'} (${newNamHoc}) đã tồn tại`,
      };
    }
    
    // Create placeholder activity for new semester
    await prisma.hoatDong.create({
      data: {
        ten_hd: `[SYSTEM] Học kỳ ${newHocKy === 'hoc_ky_1' ? '1' : '2'} năm học ${newNamHoc}`,
        mo_ta: 'Hoạt động hệ thống để đánh dấu học kỳ mới',
        hoc_ky: newHocKy,
        nam_hoc: newNamHoc,
        ngay_bd: startDate,
        ngay_kt: endDate,
        ngay_tao: new Date(),
        loai_hd_id: 'SYSTEM',
        nguoi_tao_id: user?.sub || 'admin',
        trang_thai: 'da_duyet',
      },
    });
    
    const displaySemester = newHocKy === 'hoc_ky_1' ? 'HK1' : 'HK2';
    return {
      success: true,
      message: `Đã tạo học kỳ mới: ${displaySemester} (${newNamHoc})`,
      data: {
        hoc_ky: newHocKy,
        nam_hoc: newNamHoc,
        display: `${displaySemester}_${newYear} (${newNamHoc})`,
      },
    };
  }

  /**
   * Activate a semester
   * This will become the active semester in the system
   */
  static async activateSemester(semester, user) {
    // Accept both formats:
    // - hoc_ky_1-2024 (legacy dash format)
    // - hoc_ky_1_2025 (new underscore format from dropdown)
    if (!semester || !/^hoc_ky_[12][-_]\d{4}$/.test(semester)) {
      return {
        success: false,
        message: 'Format học kỳ không hợp lệ. Ví dụ: hoc_ky_1-2024 hoặc hoc_ky_1_2025',
      };
    }

    // Normalize to dash format for consistency
    const normalizedSemester = semester.replace(/_(\d{4})$/, '-$1');

    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(process.cwd(), 'data', 'semesters');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const metadataPath = path.join(dataDir, 'metadata.json');
    
    // Read old active semester
    let oldActive = null;
    try {
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        oldActive = metadata.active_semester;
      }
    } catch (e) {
      // ignore
    }
    
    // Update metadata.json with new active semester (use normalized format)
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(
        {
          active_semester: normalizedSemester,
          updated_at: new Date().toISOString(),
          updated_by: user?.sub || 'admin',
        },
        null,
        2
      )
    );
    
    return {
      success: true,
      message: `Đã kích hoạt học kỳ ${normalizedSemester}`,
      data: {
        new_active: normalizedSemester,
        old_active: oldActive,
      },
    };
  }

  /**
   * TODO: Add more methods from semesters.route.js:
   * - Batch operations for semester closure
   * - Statistics and reporting
   * - Export functionality
   * - Advanced filtering and search
   * 
   * The current file (routes/semesters.route.js) is 853 lines.
   * Extract remaining business logic here to keep routes clean.
   */
}

module.exports = SemestersService;
