/**
 * Script kiểm tra dữ liệu trang "Hoạt động của tôi"
 * Kiểm tra xem API /core/dashboard/activities/me có trả về đúng dữ liệu không
 * Usage: node scripts/check_my_activities.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import dashboard service để test logic
const dashboardService = require('../src/modules/dashboard/dashboard.service');

async function checkMyActivities() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 KIỂM TRA TRANG "HOẠT ĐỘNG CỦA TÔI" - HK1 2025-2026');
    console.log('='.repeat(100));
    
    // 1. Tìm sinh viên
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true
          }
        },
        lop: {
          select: {
            id: true,
            ten_lop: true,
            chu_nhiem: true
          }
        }
      }
    });
    
    if (!sinhVien) {
      console.error('❌ Không tìm thấy sinh viên');
      return;
    }
    
    console.log('\n📋 THÔNG TIN SINH VIÊN:');
    console.log('   - MSSV:', sinhVien.mssv);
    console.log('   - Họ tên:', sinhVien.nguoi_dung.ho_ten);
    console.log('   - Lớp:', sinhVien.lop?.ten_lop);
    console.log('   - User ID:', sinhVien.nguoi_dung_id);
    
    // 2. Lấy class creators
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sinhVien.lop_id },
      select: { nguoi_dung_id: true }
    });
    const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
    if (sinhVien.lop?.chu_nhiem) {
      classCreatorUserIds.push(sinhVien.lop.chu_nhiem);
    }
    
    // 3. Lấy TẤT CẢ đăng ký của sinh viên trong HK1 2025-2026
    const allRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id,
        hoat_dong: {
          hoc_ky: 'hoc_ky_1',
          nam_hoc: '2025-2026'
        }
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
                ho_ten: true
              }
            }
          }
        }
      },
      orderBy: {
        ngay_dang_ky: 'desc'
      }
    });
    
    console.log('\n📝 TẤT CẢ ĐĂNG KÝ HK1 2025-2026:', allRegistrations.length);
    
    // 4. Phân loại theo trạng thái
    const byStatus = {
      cho_duyet: [],
      da_duyet: [],
      da_tham_gia: [],
      tu_choi: []
    };
    
    allRegistrations.forEach(reg => {
      const status = reg.trang_thai_dk;
      const isClassActivity = classCreatorUserIds.includes(reg.hoat_dong.nguoi_tao_id);
      
      if (byStatus[status]) {
        byStatus[status].push({
          id: reg.id,
          hd_id: reg.hoat_dong.id,
          ten_hd: reg.hoat_dong.ten_hd,
          trang_thai_dk: status,
          diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
          loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd,
          isClassActivity
        });
      }
    });
    
    console.log('\n📊 PHÂN LOẠI THEO TRẠNG THÁI:');
    Object.entries(byStatus).forEach(([status, regs]) => {
      if (regs.length > 0) {
        console.log(`\n   ${status.toUpperCase()}: ${regs.length} đăng ký`);
        regs.forEach((reg, idx) => {
          console.log(`      ${idx + 1}. ${reg.ten_hd} - ${reg.loai_hd || 'N/A'} - ${reg.diem_rl} điểm`);
          if (!reg.isClassActivity) {
            console.log(`         ⚠️  KHÔNG thuộc lớp (sẽ bị filter)`);
          }
        });
      }
    });
    
    // 5. Chỉ lấy đăng ký thuộc lớp
    const classRegistrations = allRegistrations.filter(reg => 
      classCreatorUserIds.includes(reg.hoat_dong.nguoi_tao_id)
    );
    
    console.log('\n✅ ĐĂNG KÝ THUỘC LỚP (Class Activity):', classRegistrations.length);
    
    const classByStatus = {
      cho_duyet: [],
      da_duyet: [],
      da_tham_gia: [],
      tu_choi: []
    };
    
    classRegistrations.forEach(reg => {
      const status = reg.trang_thai_dk;
      if (classByStatus[status]) {
        classByStatus[status].push({
          id: reg.id,
          hd_id: reg.hoat_dong.id,
          ten_hd: reg.hoat_dong.ten_hd,
          trang_thai_dk: status,
          diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
          loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd
        });
      }
    });
    
    console.log('\n📊 PHÂN LOẠI THEO TRẠNG THÁI (CHỈ CLASS ACTIVITIES):');
    Object.entries(classByStatus).forEach(([status, regs]) => {
      if (regs.length > 0) {
        console.log(`\n   ${status.toUpperCase()}: ${regs.length} đăng ký`);
        regs.forEach((reg, idx) => {
          console.log(`      ${idx + 1}. ${reg.ten_hd} - ${reg.loai_hd || 'N/A'} - ${reg.diem_rl} điểm`);
        });
      }
    });
    
    // 6. Test API service
    console.log('\n' + '='.repeat(100));
    console.log('🧪 TEST API SERVICE:');
    console.log('='.repeat(100));
    
    const userId = sinhVien.nguoi_dung_id;
    const query = {
      semesterValue: 'hoc_ky_1-2025'
    };
    
    try {
      const result = await dashboardService.getMyActivities(userId, query);
      
      console.log('\n✅ API RESPONSE:');
      console.log('   - Tổng số hoạt động:', result.length);
      
      // Phân loại theo trạng thái
      const apiByStatus = {
        cho_duyet: [],
        da_duyet: [],
        da_tham_gia: [],
        tu_choi: []
      };
      
      result.forEach(act => {
        const status = act.trang_thai_dk || act.status || '';
        if (apiByStatus[status]) {
          apiByStatus[status].push(act);
        }
      });
      
      console.log('\n   📊 PHÂN LOẠI THEO TRẠNG THÁI (từ API):');
      Object.entries(apiByStatus).forEach(([status, acts]) => {
        if (acts.length > 0) {
          console.log(`      - ${status}: ${acts.length}`);
        }
      });
      
      console.log('\n   📋 CHI TIẾT HOẠT ĐỘNG:');
      result.forEach((act, idx) => {
        console.log(`      ${idx + 1}. ${act.ten_hd || act.hoat_dong?.ten_hd}`);
        console.log(`         - Trạng thái: ${act.trang_thai_dk || act.status || 'N/A'}`);
        console.log(`         - Điểm: ${act.hoat_dong?.diem_rl || act.diem_rl || 0}`);
        console.log(`         - Loại: ${act.hoat_dong?.loai || act.loai_hd || 'N/A'}`);
        console.log(`         - is_class_activity: ${act.is_class_activity}`);
      });
      
      // So sánh với dữ liệu thực tế
      console.log('\n📊 SO SÁNH:');
      console.log('   - Đăng ký thuộc lớp (từ DB):', classRegistrations.length);
      console.log('   - Hoạt động API trả về:', result.length);
      
      if (classRegistrations.length === result.length) {
        console.log('   ✅ KHỚP!');
      } else {
        console.log(`   ⚠️  CHÊNH LỆCH: ${Math.abs(classRegistrations.length - result.length)} hoạt động`);
      }
      
      // So sánh theo trạng thái
      console.log('\n   📊 SO SÁNH THEO TRẠNG THÁI:');
      Object.keys(classByStatus).forEach(status => {
        const dbCount = classByStatus[status].length;
        const apiCount = apiByStatus[status]?.length || 0;
        const match = dbCount === apiCount ? '✅' : '⚠️';
        console.log(`      ${match} ${status}: DB=${dbCount}, API=${apiCount}`);
      });
      
      // So sánh với dashboard
      console.log('\n   📊 SO SÁNH VỚI DASHBOARD:');
      console.log(`      - Dashboard hiển thị: 9 hoạt động (từ console log)`);
      console.log(`      - API trả về: ${result.length} hoạt động`);
      console.log(`      - Dashboard hiển thị: 0 CHỜ DUYỆT, 1 ĐÃ DUYỆT, 8 THAM GIA, 0 TỪ CHỐI`);
      console.log(`      - API trả về: ${apiByStatus.cho_duyet.length} CHỜ DUYỆT, ${apiByStatus.da_duyet.length} ĐÃ DUYỆT, ${apiByStatus.da_tham_gia.length} THAM GIA, ${apiByStatus.tu_choi.length} TỪ CHỐI`);
      
      const dashboardMatch = 
        apiByStatus.cho_duyet.length === 0 &&
        apiByStatus.da_duyet.length === 1 &&
        apiByStatus.da_tham_gia.length === 8 &&
        apiByStatus.tu_choi.length === 0;
      
      if (dashboardMatch) {
        console.log('      ✅ KHỚP VỚI DASHBOARD!');
      } else {
        console.log('      ⚠️  KHÔNG KHỚP VỚI DASHBOARD');
      }
      
    } catch (err) {
      console.error('❌ Error calling API service:', err.message);
      console.error(err.stack);
    }
    
    // 7. Tóm tắt
    console.log('\n' + '='.repeat(100));
    console.log('📊 TÓM TẮT:');
    console.log('='.repeat(100));
    console.log(`   - Tổng đăng ký HK1 2025-2026: ${allRegistrations.length}`);
    console.log(`   - Đăng ký thuộc lớp: ${classRegistrations.length}`);
    console.log(`   - Đăng ký không thuộc lớp: ${allRegistrations.length - classRegistrations.length}`);
    console.log(`   - Phân loại theo trạng thái (chỉ class activities):`);
    Object.entries(classByStatus).forEach(([status, regs]) => {
      if (regs.length > 0) {
        console.log(`      + ${status}: ${regs.length}`);
      }
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ KIỂM TRA HOÀN TẤT');
    console.log('='.repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkMyActivities();

