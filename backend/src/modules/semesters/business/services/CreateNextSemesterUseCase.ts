/**
 * CreateNextSemesterUseCase
 * Use case for creating next semester automatically
 * Follows Single Responsibility Principle (SRP)
 */

import type { HocKy, LoaiHoatDong } from '@prisma/client';
import type ISemesterRepository from '../interfaces/ISemesterRepository';

interface User {
  sub?: string;
  id?: string;
}

interface SemesterData {
  hoc_ky: HocKy;
  nam_hoc: string;
  display: string;
}

interface CreateSemesterResult {
  success: boolean;
  message: string;
  data?: SemesterData;
}

interface SemesterRow {
  hoc_ky: HocKy | null;
  nam_hoc: string | null;
}

interface SemesterWithIndex extends SemesterRow {
  idx: number;
}

class CreateNextSemesterUseCase {
  private semesterRepository: ISemesterRepository;

  constructor(semesterRepository: ISemesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  /**
   * Execute use case
   * @param user - User object with sub/id
   * @returns Result with success flag and data
   */
  async execute(user: User): Promise<CreateSemesterResult> {
    // Get or create system activity type for semester management
    let systemActivityType: LoaiHoatDong | null = await this.semesterRepository.findSystemActivityType();
    
    if (!systemActivityType) {
      systemActivityType = await this.semesterRepository.createSystemActivityType();
    }
    
    // Get latest semester from database
    const rows: SemesterRow[] = await this.semesterRepository.getDistinctSemesters();

    // Filter valid semesters (format: YYYY - single year)
    const valid = rows.filter((r): r is SemesterRow & { nam_hoc: string } => 
      /^\d{4}$/.test(r.nam_hoc || '')
    );
    
    let latestSemester: { hoc_ky: HocKy | null; nam_hoc: string } | null = null;
    if (valid.length > 0) {
      // Sort by year and semester
      const withIndex: SemesterWithIndex[] = valid.map(r => {
        const year = parseInt(r.nam_hoc);
        const idx = year * 2 + (r.hoc_ky === 'hoc_ky_2' ? 1 : 0);
        return { ...r, idx };
      });
      withIndex.sort((a, b) => b.idx - a.idx);
      latestSemester = { hoc_ky: withIndex[0].hoc_ky, nam_hoc: withIndex[0].nam_hoc! };
    }

    // If no data, create HK1 of current year
    if (!latestSemester) {
      const currentYear = new Date().getFullYear();
      const newHocKy: HocKy = 'hoc_ky_1';
      const newNamHoc = String(currentYear);
      
      await this.semesterRepository.createSemesterSystemActivity({
        hoc_ky: newHocKy,
        nam_hoc: newNamHoc,
        ngay_bd: new Date(`${currentYear}-09-01`),
        ngay_kt: new Date(`${currentYear + 1}-01-01`),
        loai_hd_id: systemActivityType.id,
        nguoi_tao_id: user?.sub || 'admin'
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
    
    let newHocKy: HocKy;
    let newNamHoc: string;
    let newYear: number;
    let startDate: Date;
    let endDate: Date;
    
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
    const existing = await this.semesterRepository.existsSemesterActivity(newHocKy, newNamHoc);
    
    if (existing) {
      return {
        success: false,
        message: `Học kỳ ${newHocKy === 'hoc_ky_1' ? 'HK1' : 'HK2'} (${newNamHoc}) đã tồn tại`,
      };
    }
    
    // Create placeholder activity for new semester
    await this.semesterRepository.createSemesterSystemActivity({
      hoc_ky: newHocKy,
      nam_hoc: newNamHoc,
      ngay_bd: startDate,
      ngay_kt: endDate,
      loai_hd_id: systemActivityType.id,
      nguoi_tao_id: user?.sub || 'admin'
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

export default CreateNextSemesterUseCase;
module.exports = CreateNextSemesterUseCase;
