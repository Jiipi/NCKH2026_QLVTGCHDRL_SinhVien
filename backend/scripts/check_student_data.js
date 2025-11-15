/**
 * Script kiểm tra dữ liệu sinh viên 202101002
 * Kiểm tra xem dữ liệu có đúng với logic filter theo lớp không
 * Usage: node scripts/check_student_data.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudentData() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 KIỂM TRA DỮ LIỆU SINH VIÊN:', mssv);
    console.log('='.repeat(100));
    
    // 1. Tìm sinh viên
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true,
            email: true,
            ten_dn: true
          }
        },
        lop: {
          select: {
            id: true,
            ten_lop: true,
            khoa: true,
            chu_nhiem: true
          }
        }
      }
    });
    
    if (!sinhVien) {
      console.error('❌ Không tìm thấy sinh viên với MSSV:', mssv);
      return;
    }
    
    console.log('\n📋 1. THÔNG TIN SINH VIÊN:');
    console.log('   - ID:', sinhVien.id);
    console.log('   - MSSV:', sinhVien.mssv);
    console.log('   - Họ tên:', sinhVien.nguoi_dung.ho_ten);
    console.log('   - Email:', sinhVien.nguoi_dung.email);
    console.log('   - User ID:', sinhVien.nguoi_dung_id);
    console.log('   - Lớp ID:', sinhVien.lop_id);
    console.log('   - Tên lớp:', sinhVien.lop?.ten_lop);
    console.log('   - Khoa:', sinhVien.lop?.khoa);
    console.log('   - Chủ nhiệm ID:', sinhVien.lop?.chu_nhiem);
    
    // 2. Lấy tất cả sinh viên trong lớp
    const lopId = sinhVien.lop_id;
    const chuNhiemId = sinhVien.lop?.chu_nhiem;
    
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: {
        id: true,
        mssv: true,
        nguoi_dung_id: true
      }
    });
    
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (chuNhiemId) {
      classCreatorUserIds.push(chuNhiemId);
    }
    
    console.log('\n👥 2. CLASS CREATORS (Sinh viên trong lớp + GVCN):');
    console.log('   - Tổng số:', classCreatorUserIds.length);
    console.log('   - Số sinh viên trong lớp:', classStudents.length);
    console.log('   - GVCN ID:', chuNhiemId || 'Không có');
    
    // 3. Lấy TẤT CẢ đăng ký của sinh viên (không filter)
    const allRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                ten_loai_hd: true,
                diem_toi_da: true
              }
            },
            nguoi_tao: {
              select: {
                id: true,
                ho_ten: true,
                ten_dn: true
              }
            }
          }
        }
      },
      orderBy: {
        ngay_dang_ky: 'desc'
      }
    });
    
    console.log('\n📝 3. TẤT CẢ ĐĂNG KÝ CỦA SINH VIÊN (không filter):');
    console.log('   - Tổng số:', allRegistrations.length);
    
    // Phân loại đăng ký
    const classActivityRegs = [];
    const nonClassActivityRegs = [];
    
    allRegistrations.forEach(reg => {
      const creatorId = reg.hoat_dong.nguoi_tao?.id;
      const isClassActivity = classCreatorUserIds.includes(creatorId);
      
      const regInfo = {
        id: reg.id,
        hd_id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        hoc_ky: reg.hoat_dong.hoc_ky,
        nam_hoc: reg.hoat_dong.nam_hoc,
        trang_thai_dk: reg.trang_thai_dk,
        diem_rl: reg.hoat_dong.diem_rl,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd,
        nguoi_tao: reg.hoat_dong.nguoi_tao?.ho_ten || reg.hoat_dong.nguoi_tao?.ten_dn || 'Unknown',
        nguoi_tao_id: creatorId,
        isClassActivity
      };
      
      if (isClassActivity) {
        classActivityRegs.push(regInfo);
      } else {
        nonClassActivityRegs.push(regInfo);
      }
    });
    
    console.log('\n   ✅ ĐĂNG KÝ HOẠT ĐỘNG CỦA LỚP (Class Activity = true):', classActivityRegs.length);
    classActivityRegs.forEach((reg, idx) => {
      console.log(`      ${idx + 1}. ${reg.ten_hd}`);
      console.log(`         - Học kỳ: ${reg.hoc_ky} ${reg.nam_hoc}`);
      console.log(`         - Trạng thái: ${reg.trang_thai_dk}`);
      console.log(`         - Điểm: ${reg.diem_rl}`);
      console.log(`         - Loại: ${reg.loai_hd}`);
      console.log(`         - Người tạo: ${reg.nguoi_tao} (${reg.nguoi_tao_id})`);
    });
    
    console.log('\n   ❌ ĐĂNG KÝ HOẠT ĐỘNG KHÔNG CỦA LỚP (Class Activity = false):', nonClassActivityRegs.length);
    nonClassActivityRegs.forEach((reg, idx) => {
      console.log(`      ${idx + 1}. ${reg.ten_hd}`);
      console.log(`         - Học kỳ: ${reg.hoc_ky} ${reg.nam_hoc}`);
      console.log(`         - Trạng thái: ${reg.trang_thai_dk}`);
      console.log(`         - Điểm: ${reg.diem_rl}`);
      console.log(`         - Loại: ${reg.loai_hd}`);
      console.log(`         - Người tạo: ${reg.nguoi_tao} (${reg.nguoi_tao_id})`);
      console.log(`         - ⚠️  VẤN ĐỀ: Hoạt động này KHÔNG được tạo bởi class creators!`);
    });
    
    // 4. Lấy TẤT CẢ điểm danh của sinh viên
    const allAttendances = await prisma.diemDanh.findMany({
      where: {
        sv_id: sinhVien.id,
        xac_nhan_tham_gia: true
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: {
              select: {
                ten_loai_hd: true
              }
            },
            nguoi_tao: {
              select: {
                id: true,
                ho_ten: true,
                ten_dn: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n✅ 4. TẤT CẢ ĐIỂM DANH (đã tham gia):');
    console.log('   - Tổng số:', allAttendances.length);
    
    const classActivityAttendances = [];
    const nonClassActivityAttendances = [];
    
    allAttendances.forEach(att => {
      const creatorId = att.hoat_dong.nguoi_tao?.id;
      const isClassActivity = classCreatorUserIds.includes(creatorId);
      
      const attInfo = {
        id: att.id,
        hd_id: att.hoat_dong.id,
        ten_hd: att.hoat_dong.ten_hd,
        hoc_ky: att.hoat_dong.hoc_ky,
        nam_hoc: att.hoat_dong.nam_hoc,
        diem_rl: att.hoat_dong.diem_rl,
        loai_hd: att.hoat_dong.loai_hd?.ten_loai_hd,
        nguoi_tao: att.hoat_dong.nguoi_tao?.ho_ten || att.hoat_dong.nguoi_tao?.ten_dn || 'Unknown',
        nguoi_tao_id: creatorId,
        isClassActivity
      };
      
      if (isClassActivity) {
        classActivityAttendances.push(attInfo);
      } else {
        nonClassActivityAttendances.push(attInfo);
      }
    });
    
    console.log('\n   ✅ ĐIỂM DANH HOẠT ĐỘNG CỦA LỚP:', classActivityAttendances.length);
    classActivityAttendances.forEach((att, idx) => {
      console.log(`      ${idx + 1}. ${att.ten_hd} - ${att.hoc_ky} ${att.nam_hoc} - Điểm: ${att.diem_rl}`);
    });
    
    console.log('\n   ❌ ĐIỂM DANH HOẠT ĐỘNG KHÔNG CỦA LỚP:', nonClassActivityAttendances.length);
    if (nonClassActivityAttendances.length > 0) {
      nonClassActivityAttendances.forEach((att, idx) => {
        console.log(`      ${idx + 1}. ${att.ten_hd}`);
        console.log(`         - Học kỳ: ${att.hoc_ky} ${att.nam_hoc}`);
        console.log(`         - Điểm: ${att.diem_rl}`);
        console.log(`         - Người tạo: ${att.nguoi_tao} (${att.nguoi_tao_id})`);
        console.log(`         - ⚠️  VẤN ĐỀ: Điểm danh này KHÔNG thuộc hoạt động của lớp!`);
      });
    }
    
    // 5. Tính điểm theo logic hiện tại (chỉ class activities)
    console.log('\n💰 5. TÍNH ĐIỂM THEO LOGIC HIỆN TẠI (chỉ class activities):');
    
    // Lấy đăng ký của class activities
    const classRegIds = new Set(classActivityRegs.map(r => r.hd_id));
    const classAttIds = new Set(classActivityAttendances.map(a => a.hd_id));
    
    // Chỉ tính điểm cho hoạt động có cả đăng ký VÀ điểm danh
    const validActivityIds = new Set();
    classRegIds.forEach(hdId => {
      if (classAttIds.has(hdId)) {
        validActivityIds.add(hdId);
      }
    });
    
    let totalPoints = 0;
    const pointsByType = {};
    
    classActivityAttendances.forEach(att => {
      if (validActivityIds.has(att.hd_id)) {
        const points = parseFloat(att.diem_rl || 0);
        const type = att.loai_hd || 'Khác';
        
        if (!pointsByType[type]) {
          pointsByType[type] = { count: 0, total: 0 };
        }
        pointsByType[type].count++;
        pointsByType[type].total += points;
        totalPoints += points;
      }
    });
    
    console.log('   - Số hoạt động hợp lệ (có đăng ký + điểm danh):', validActivityIds.size);
    console.log('   - Tổng điểm:', totalPoints.toFixed(2));
    console.log('   - Điểm theo loại:');
    Object.entries(pointsByType).forEach(([type, data]) => {
      console.log(`      + ${type}: ${data.count} hoạt động, ${data.total.toFixed(2)} điểm`);
    });
    
    // 6. So sánh với dữ liệu thực tế (nếu có điểm danh không thuộc lớp)
    if (nonClassActivityAttendances.length > 0) {
      console.log('\n⚠️  6. CẢNH BÁO: CÓ ĐIỂM DANH KHÔNG THUỘC LỚP!');
      console.log('   - Số lượng:', nonClassActivityAttendances.length);
      console.log('   - Các hoạt động này KHÔNG nên được tính điểm cho sinh viên này');
      console.log('   - Nguyên nhân có thể:');
      console.log('     + Hoạt động được tạo bởi admin/giảng viên khác lớp');
      console.log('     + Sinh viên đã đăng ký và điểm danh hoạt động không thuộc lớp');
      console.log('     + Logic filter trong backend có thể chưa đúng');
    }
    
    // 7. Kiểm tra học kỳ hiện tại
    console.log('\n📅 7. KIỂM TRA HỌC KỲ:');
    try {
      const currentSemester = await prisma.hocKy.findFirst({
        where: { isCurrent: true }
      });
      
      if (currentSemester) {
        console.log('   - Học kỳ hiện tại:', `${currentSemester.semester}-${currentSemester.year}`);
        console.log('   - Năm học:', currentSemester.nam_hoc);
        
        // Đếm đăng ký theo học kỳ
        const regsBySemester = {};
        allRegistrations.forEach(reg => {
          const key = `${reg.hoat_dong.hoc_ky}_${reg.hoat_dong.nam_hoc}`;
          if (!regsBySemester[key]) {
            regsBySemester[key] = { total: 0, class: 0, nonClass: 0 };
          }
          regsBySemester[key].total++;
          if (classCreatorUserIds.includes(reg.hoat_dong.nguoi_tao?.id)) {
            regsBySemester[key].class++;
          } else {
            regsBySemester[key].nonClass++;
          }
        });
        
        console.log('\n   - Đăng ký theo học kỳ:');
        Object.entries(regsBySemester).forEach(([sem, data]) => {
          console.log(`      ${sem}: Tổng ${data.total} (Lớp: ${data.class}, Không lớp: ${data.nonClass})`);
        });
      } else {
        console.log('   - Không có học kỳ hiện tại được đặt');
      }
    } catch (err) {
      console.log('   - Không thể kiểm tra học kỳ (bảng có thể không tồn tại)');
    }
    
    // 8. Tóm tắt vấn đề
    console.log('\n' + '='.repeat(100));
    console.log('📊 TÓM TẮT:');
    console.log('='.repeat(100));
    console.log(`   - Tổng đăng ký: ${allRegistrations.length}`);
    console.log(`   - Đăng ký hoạt động lớp: ${classActivityRegs.length}`);
    console.log(`   - Đăng ký hoạt động không lớp: ${nonClassActivityRegs.length}`);
    console.log(`   - Tổng điểm danh: ${allAttendances.length}`);
    console.log(`   - Điểm danh hoạt động lớp: ${classActivityAttendances.length}`);
    console.log(`   - Điểm danh hoạt động không lớp: ${nonClassActivityAttendances.length}`);
    console.log(`   - Điểm tính được (chỉ class activities): ${totalPoints.toFixed(2)}`);
    
    if (nonClassActivityRegs.length > 0 || nonClassActivityAttendances.length > 0) {
      console.log('\n   ⚠️  VẤN ĐỀ PHÁT HIỆN:');
      if (nonClassActivityRegs.length > 0) {
        console.log(`      - Có ${nonClassActivityRegs.length} đăng ký hoạt động không thuộc lớp`);
        console.log('      - Các đăng ký này KHÔNG nên được hiển thị trong dashboard');
      }
      if (nonClassActivityAttendances.length > 0) {
        console.log(`      - Có ${nonClassActivityAttendances.length} điểm danh hoạt động không thuộc lớp`);
        console.log('      - Các điểm danh này KHÔNG nên được tính điểm');
      }
      console.log('\n   💡 GIẢI PHÁP:');
      console.log('      - Backend đã filter đúng (chỉ lấy hoạt động từ class creators)');
      console.log('      - Các đăng ký/điểm danh không thuộc lớp sẽ KHÔNG được trả về trong API');
      console.log('      - Nếu vẫn thấy dữ liệu sai, kiểm tra:');
      console.log('        1. Frontend có cache dữ liệu cũ không');
      console.log('        2. Semester filter có được gửi đúng không');
      console.log('        3. API response có đúng không');
    } else {
      console.log('\n   ✅ KHÔNG CÓ VẤN ĐỀ: Tất cả đăng ký và điểm danh đều thuộc hoạt động của lớp');
    }
    
    console.log('\n' + '='.repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudentData();
