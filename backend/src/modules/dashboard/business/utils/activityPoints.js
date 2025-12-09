/**
 * Tính điểm cho hoạt động
 * Ưu tiên diem_rl của hoạt động, nếu null/undefined hoặc = 0 thì dùng diem_mac_dinh của loại hoạt động
 * @param {Object} activity - Đối tượng hoạt động
 * @returns {Number} Điểm rèn luyện
 */
function calculateActivityPoints(activity) {
  if (!activity) return 0;
  
  // Xử lý diem_rl (có thể là Decimal, Number, hoặc String)
  let diemRl = null;
  if (activity.diem_rl != null && activity.diem_rl !== undefined) {
    // Xử lý Decimal type từ Prisma
    if (typeof activity.diem_rl === 'object' && activity.diem_rl.toNumber) {
      diemRl = activity.diem_rl.toNumber();
    } else {
      diemRl = parseFloat(activity.diem_rl);
    }
    
    // Nếu parseFloat trả về NaN hoặc không phải số hợp lệ, coi như null
    if (isNaN(diemRl) || !isFinite(diemRl)) {
      diemRl = null;
    }
  }
  
  // Nếu hoạt động có điểm được set và > 0, dùng điểm đó
  if (diemRl != null && diemRl > 0) {
    return diemRl;
  }
  
  // Nếu không có điểm hoặc = 0, dùng điểm mặc định của loại hoạt động
  if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
    let diemMacDinh = 0;
    
    // Xử lý Decimal type từ Prisma
    if (typeof activity.loai_hd.diem_mac_dinh === 'object' && activity.loai_hd.diem_mac_dinh.toNumber) {
      diemMacDinh = activity.loai_hd.diem_mac_dinh.toNumber();
    } else {
      diemMacDinh = parseFloat(activity.loai_hd.diem_mac_dinh) || 0;
    }
    
    // Nếu parseFloat trả về NaN, trả về 0
    return isNaN(diemMacDinh) || !isFinite(diemMacDinh) ? 0 : diemMacDinh;
  }
  
  return 0;
}

module.exports = { calculateActivityPoints };
