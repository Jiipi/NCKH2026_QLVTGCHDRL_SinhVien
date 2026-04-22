/**
 * Registration Export Service
 * Handles exporting registrations to Excel
 * Follows Single Responsibility Principle (SRP)
 */

import { parseSemesterString } from '../../../../core/utils/semester';
import { ValidationError } from '../../../../core/errors/AppError';
import type { HocKy, TrangThaiDangKy } from '@prisma/client';
import type { IRegistrationRepository, RegistrationExportItem } from '../interfaces/IRegistrationRepository';

interface ExcelWorksheet {
  columns: Array<{ header: string; key: string; width: number }>;
  getRow(index: number): {
    font?: { bold?: boolean };
    fill?: { type: string; pattern: string; fgColor: { argb: string } };
    alignment?: { vertical: string; horizontal: string };
  };
  addRow(data: Record<string, string | number>): void;
}

// ExcelJS is required dynamically, so we define a minimal type
export interface ExcelWorkbook {
  addWorksheet(name: string): ExcelWorksheet;
  xlsx: {
    writeBuffer(): Promise<Buffer>;
    write(stream: NodeJS.WritableStream): Promise<void>;
  };
}

/**
 * Export filter options
 */
export interface ExportFilters {
  status?: TrangThaiDangKy;
  hoc_ky?: HocKy;
  nam_hoc?: string;
  semester?: string;
  classId?: string;
}

/**
 * RegistrationExportService
 */
export class RegistrationExportService {
  constructor(private readonly registrationRepository: IRegistrationRepository) {}

  /**
   * Export registrations to Excel
   */
  async exportRegistrations(filters: ExportFilters = {}): Promise<ExcelWorkbook> {
    const ExcelJS = await import('exceljs');

    const { status, hoc_ky, nam_hoc, semester, classId } = filters;

    let resolvedHocKy: HocKy | undefined = hoc_ky;
    let resolvedNamHoc: string | undefined = nam_hoc;
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (!parsed) {
        throw new ValidationError('Tham số học kỳ không hợp lệ');
      }
      resolvedHocKy = parsed.semester as HocKy;
      resolvedNamHoc = parsed.year;
    }

    const items = await this.registrationRepository.findRegistrationsForExport({
      ...(status ? { status } : {}),
      ...(resolvedHocKy ? { hoc_ky: resolvedHocKy } : {}),
      ...(resolvedNamHoc ? { nam_hoc: resolvedNamHoc } : {}),
      ...(classId ? { classId } : {})
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Đăng ký hoạt động');

    // Define columns
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Mã SV', key: 'mssv', width: 12 },
      { header: 'Họ tên SV', key: 'ho_ten', width: 25 },
      { header: 'Lớp', key: 'lop', width: 15 },
      { header: 'Mã HD', key: 'ma_hd', width: 15 },
      { header: 'Tên hoạt động', key: 'ten_hd', width: 35 },
      { header: 'Loại HD', key: 'loai_hd', width: 20 },
      { header: 'Ngày đăng ký', key: 'ngay_dk', width: 15 },
      { header: 'Trạng thái', key: 'trang_thai', width: 15 },
      { header: 'Ngày duyệt', key: 'ngay_duyet', width: 15 },
      { header: 'Lý do đăng ký', key: 'ly_do_dk', width: 30 },
      { header: 'Lý do từ chối', key: 'ly_do_tu_choi', width: 30 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE67E22' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    items.forEach((item, index) => {
      worksheet.addRow({
        stt: index + 1,
        mssv: item.sinh_vien?.mssv || '',
        ho_ten: item.sinh_vien?.nguoi_dung?.ho_ten || '',
        lop: item.sinh_vien?.lop?.ten_lop || '',
        ma_hd: item.hoat_dong?.ma_hd || '',
        ten_hd: item.hoat_dong?.ten_hd || '',
        loai_hd: item.hoat_dong?.loai_hd?.ten_loai_hd || '',
        ngay_dk: item.ngay_dang_ky ? new Date(item.ngay_dang_ky).toLocaleDateString('vi-VN') : '',
        trang_thai: item.trang_thai_dk || '',
        ngay_duyet: item.ngay_duyet ? new Date(item.ngay_duyet).toLocaleDateString('vi-VN') : '',
        ly_do_dk: item.ly_do_dk || '',
        ly_do_tu_choi: item.ly_do_tu_choi || ''
      });
    });

    return workbook;
  }
}

export default RegistrationExportService;
module.exports = RegistrationExportService;
