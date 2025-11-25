const { CSV_HEADERS } = require('./admin-users.constants');

function mapUserToListItem(user) {
  return {
    id: user.id,
    maso: user.ten_dn,
    hoten: user.ho_ten,
    email: user.email,
    ten_dn: user.ten_dn,
    ho_ten: user.ho_ten,
    anh_dai_dien: user.anh_dai_dien,
    vai_tro_id: user.vai_tro_id,
    vai_tro: user.vai_tro ? { id: user.vai_tro.id, ten_vt: user.vai_tro.ten_vt } : null,
    role: user.vai_tro?.ten_vt || 'Sinh viên',
    lop: user.sinh_vien?.lop?.ten_lop || '',
    khoa: user.sinh_vien?.lop?.khoa || '',
    sdt: user.sinh_vien?.sdt || '',
    so_lop_cn: user._count?.lops_chu_nhiem || 0,
    so_hd_tao: user._count?.hoat_dong_tao || 0,
    quyen_count: Array.isArray(user.vai_tro?.quyen_han) ? user.vai_tro.quyen_han.length : 0,
    trang_thai: user.trang_thai,
    ngay_tao: user.ngay_tao,
    sinh_vien: user.sinh_vien
      ? {
          mssv: user.sinh_vien.mssv,
          ngay_sinh: user.sinh_vien.ngay_sinh,
          gt: user.sinh_vien.gt,
          dia_chi: user.sinh_vien.dia_chi,
          sdt: user.sinh_vien.sdt,
          email: user.sinh_vien.email,
          nguoi_dung: {
            ho_ten: user.ho_ten,
            email: user.email,
            anh_dai_dien: user.anh_dai_dien
          },
          lop: user.sinh_vien.lop
            ? {
                ten_lop: user.sinh_vien.lop.ten_lop,
                khoa: user.sinh_vien.lop.khoa,
                nien_khoa: user.sinh_vien.lop.nien_khoa
              }
            : null
        }
      : null
  };
}

function mapUserToDetail(user) {
  return {
    id: user.id,
    ho_ten: user.ho_ten,
    email: user.email,
    ten_dn: user.ten_dn,
    vai_tro: user.vai_tro?.ten_vt || 'ADMIN',
    trang_thai: user.trang_thai,
    ngay_tao: user.ngay_tao,
    sinh_vien: user.sinh_vien
      ? {
          mssv: user.sinh_vien.mssv,
          ngay_sinh: user.sinh_vien.ngay_sinh,
          gt: user.sinh_vien.gt,
          dia_chi: user.sinh_vien.dia_chi,
          sdt: user.sinh_vien.sdt,
          email: user.sinh_vien.email,
          lop: user.sinh_vien.lop
            ? {
                ten_lop: user.sinh_vien.lop.ten_lop,
                khoa: user.sinh_vien.lop.khoa,
                nien_khoa: user.sinh_vien.lop.nien_khoa
              }
            : null
        }
      : null
  };
}

function mapUsersToCsv(users) {
  const rows = users.map((user) => [
    user.ten_dn,
    user.ho_ten || '',
    user.email,
    user.vai_tro?.ten_vt || '',
    user.trang_thai,
    user.sinh_vien?.lop?.ten_lop || '',
    user.sinh_vien?.lop?.khoa || '',
    (user.ngay_tao || '').toISOString?.() || ''
  ]);

  const csv = [
    CSV_HEADERS.join(','),
    ...rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return `\uFEFF${csv}`;
}

module.exports = {
  mapUserToListItem,
  mapUserToDetail,
  mapUsersToCsv
};

