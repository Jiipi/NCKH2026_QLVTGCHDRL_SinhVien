/**
 * Registration Export Service
 * Handles exporting registrations to Excel
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../infrastructure/prisma/client');
const { parseSemesterString } = require('../../../core/utils/semester');
const { ValidationError } = require('../../../core/errors/AppError');

class RegistrationExportService {
  /**
   * Export registrations to Excel
   */
  async exportRegistrations(filters = {}) {
    const ExcelJS = require('exceljs');

    const { status, hoc_ky, nam_hoc, semester, classId } = filters;

    let semesterWhere = {};
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (!parsed) {
        throw new ValidationError('Tham số học kỳ không hợp lệ');
      }
      semesterWhere = {
        hoat_dong: {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        }
      };
    } else if (hoc_ky || nam_hoc) {
      semesterWhere = {
        hoat_dong: {
          ...(hoc_ky ? { hoc_ky } : {}),
          ...(nam_hoc ? { nam_hoc } : {})
        }
      };
    }

    const where = {
      ...(status ? { trang_thai_dk: status } : {}),
      ...semesterWhere,
      ...(classId ? { sinh_vien: { lop_id: classId } } : {})
    };

    const items = await prisma.dangKyHoatDong.findMany({
      where,
      include: {
        sinh_vien: { include: { nguoi_dung: true, lop: true } },
        hoat_dong: { include: { loai_hd: true } }
      },
      orderBy: { ngay_dang_ky: 'desc' }
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

module.exports = RegistrationExportService;

