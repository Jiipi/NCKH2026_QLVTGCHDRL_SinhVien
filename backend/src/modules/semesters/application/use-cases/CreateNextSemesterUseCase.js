/**
 * CreateNextSemesterUseCase
 * Use case for creating next semester automatically
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../../infrastructure/prisma/client');

class CreateNextSemesterUseCase {
  /**
   * Execute use case
   * @param {Object} user - User object with sub/id
   * @returns {Promise<Object>} Result with success flag and data
   */
  async execute(user) {
    // Get or create system activity type for semester management
    let systemActivityType = await prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: 'Hệ thống' },
    });
    
    if (!systemActivityType) {
      systemActivityType = await prisma.loaiHoatDong.create({
        data: {
          ten_loai_hd: 'Hệ thống',
          mo_ta: 'Loại hoạt động hệ thống để quản lý học kỳ',
          diem_mac_dinh: 0,
          diem_toi_da: 0,
          mau_sac: '#94a3b8',
        },
      });
    }
    
    // Get latest semester from database
    const rows = await prisma.hoatDong.findMany({
      select: { hoc_ky: true, nam_hoc: true },
      distinct: ['hoc_ky', 'nam_hoc'],
      where: {
        nam_hoc: { not: null },
      },
    });

    // Filter valid semesters (format: YYYY - single year)
    const valid = rows.filter(r => /^\d{4}$/.test(r.nam_hoc || ''));
    
    let latestSemester = null;
    if (valid.length > 0) {
      // Sort by year and semester
      const withIndex = valid.map(r => {
        const year = parseInt(r.nam_hoc);
        const idx = year * 2 + (r.hoc_ky === 'hoc_ky_2' ? 1 : 0);
        return { ...r, idx };
      });
      withIndex.sort((a, b) => b.idx - a.idx);
      latestSemester = { hoc_ky: withIndex[0].hoc_ky, nam_hoc: withIndex[0].nam_hoc };
    }

    // If no data, create HK1 of current year
    if (!latestSemester) {
      const currentYear = new Date().getFullYear();
      const newHocKy = 'hoc_ky_1';
      const newNamHoc = String(currentYear);
      
      await prisma.hoatDong.create({
        data: {
          ten_hd: `[SYSTEM] Học kỳ 1 năm học ${newNamHoc}`,
          mo_ta: 'Hoạt động hệ thống để đánh dấu học kỳ mới',
          hoc_ky: newHocKy,
          nam_hoc: newNamHoc,
          ngay_bd: new Date(`${currentYear}-09-01`),
          ngay_kt: new Date(`${currentYear + 1}-01-01`),
          ngay_tao: new Date(),
          loai_hd_id: systemActivityType.id,
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
    const currentYear = parseInt(latestSemester.nam_hoc);
    
    let newHocKy, newNamHoc, newYear, startDate, endDate;
    
    if (currentHocKy === 'hoc_ky_1') {
      // HK1 → HK2 (same year)
      newHocKy = 'hoc_ky_2';
      newNamHoc = String(currentYear);
      newYear = currentYear;
      startDate = new Date(`${currentYear}-02-01`);
      endDate = new Date(`${currentYear}-06-30`);
    } else {
      // HK2 → HK1 (next year)
      newHocKy = 'hoc_ky_1';
      newYear = currentYear + 1;
      newNamHoc = String(newYear);
      startDate = new Date(`${newYear}-09-01`);
      endDate = new Date(`${newYear + 1}-01-31`);
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
        loai_hd_id: systemActivityType.id,
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
}

module.exports = CreateNextSemesterUseCase;

