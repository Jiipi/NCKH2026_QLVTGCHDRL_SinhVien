/**
 * Class Activity Counter Utility
 * Hàm chung để đếm tổng hoạt động của một lớp
 * 
 * Logic chuẩn (theo schema mới):
 * - Đếm tất cả hoạt động trong bảng HoatDong
 * - Filter: trang_thai IN ('da_duyet', 'ket_thuc')
 * - Filter: lop_id = id lớp
 * - Optional: filter theo hoc_ky + nam_hoc
 */

const { prisma } = require('../../data/infrastructure/prisma/client');

/**
 * Đếm tổng hoạt động của lớp theo chuẩn
 * @param {string} classId - ID lớp
 * @param {Object} semesterFilter - Optional { hoc_ky, nam_hoc }
 * @returns {Promise<number>} - Số lượng hoạt động
 */
async function countClassActivities(classId, semesterFilter = {}) {
  const where = {
    lop_id: classId,
    trang_thai: { in: ['da_duyet', 'ket_thuc'] }
  };

  // Thêm filter học kỳ nếu có
  if (semesterFilter.hoc_ky) {
    where.hoc_ky = semesterFilter.hoc_ky;
  }
  if (semesterFilter.nam_hoc) {
    // Data đã được chuẩn hóa sang năm đơn, dùng exact match hoặc contains để backward compatible
    // Nếu user gửi "2025-2026", extract năm đầu
    const year = String(semesterFilter.nam_hoc).match(/^(\d{4})/)?.[1] || semesterFilter.nam_hoc;
    where.nam_hoc = year;
  }

  return prisma.hoatDong.count({ where });
}

/**
 * Lấy danh sách hoạt động của lớp theo chuẩn
 * @param {string} classId - ID lớp
 * @param {Object} semesterFilter - Optional { hoc_ky, nam_hoc }
 * @param {Object} options - Optional { limit, orderBy }
 * @returns {Promise<Array>} - Danh sách hoạt động
 */
async function getClassActivities(classId, semesterFilter = {}, options = {}) {
  const where = {
    lop_id: classId,
    trang_thai: { in: ['da_duyet', 'ket_thuc'] }
  };

  // Thêm filter học kỳ nếu có
  if (semesterFilter.hoc_ky) {
    where.hoc_ky = semesterFilter.hoc_ky;
  }
  if (semesterFilter.nam_hoc) {
    // Data đã được chuẩn hóa sang năm đơn
    const year = String(semesterFilter.nam_hoc).match(/^(\d{4})/)?.[1] || semesterFilter.nam_hoc;
    where.nam_hoc = year;
  }

  const queryOptions = {
    where,
    orderBy: options.orderBy || { ngay_cap_nhat: 'desc' },
    include: {
      loai_hd: {
        select: { id: true, ten_loai_hd: true, mau_sac: true }
      },
      nguoi_tao: {
        select: { id: true, ho_ten: true }
      }
    }
  };

  if (options.limit) {
    queryOptions.take = options.limit;
  }

  return prisma.hoatDong.findMany(queryOptions);
}

module.exports = {
  countClassActivities,
  getClassActivities
};

