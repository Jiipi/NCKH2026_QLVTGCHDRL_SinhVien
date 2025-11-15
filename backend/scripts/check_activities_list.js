/**
 * Script kiểm tra dữ liệu trang danh sách hoạt động
 * Kiểm tra xem API /core/activities có trả về đúng dữ liệu cho HK1 2025-2026 không
 * Usage: node scripts/check_activities_list.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import activities service để test logic
const activitiesService = require('../src/modules/activities/activities.service');

async function checkActivitiesList() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🔍 KIỂM TRA TRANG DANH SÁCH HOẠT ĐỘNG - HK1 2025-2026');
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
    
    console.log('\n👥 CLASS CREATORS:', classCreatorUserIds.length);
    
    // 3. Lấy TẤT CẢ hoạt động trong HK1 2025-2026 (không filter)
    const allActivities = await prisma.hoatDong.findMany({
      where: {
        hoc_ky: 'hoc_ky_1',
        nam_hoc: '2025-2026'
      },
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
      },
      orderBy: {
        ngay_tao: 'desc'
      }
    });
    
    console.log('\n📊 TẤT CẢ HOẠT ĐỘNG HK1 2025-2026 (không filter):', allActivities.length);
    
    // 4. Phân loại hoạt động
    const classActivities = [];
    const nonClassActivities = [];
    
    allActivities.forEach(act => {
      const isClassActivity = classCreatorUserIds.includes(act.nguoi_tao_id);
      
      const actInfo = {
        id: act.id,
        ten_hd: act.ten_hd,
        trang_thai: act.trang_thai,
        diem_rl: parseFloat(act.diem_rl || 0),
        loai_hd: act.loai_hd?.ten_loai_hd,
        nguoi_tao: act.nguoi_tao?.ho_ten || act.nguoi_tao?.ten_dn || 'Unknown',
        nguoi_tao_id: act.nguoi_tao_id,
        ngay_bd: act.ngay_bd,
        ngay_kt: act.ngay_kt,
        isClassActivity
      };
      
      if (isClassActivity) {
        classActivities.push(actInfo);
      } else {
        nonClassActivities.push(actInfo);
      }
    });
    
    console.log('\n   ✅ HOẠT ĐỘNG THUỘC LỚP (Class Activity):', classActivities.length);
    console.log('   ❌ HOẠT ĐỘNG KHÔNG THUỘC LỚP (Non-Class):', nonClassActivities.length);
    
    if (nonClassActivities.length > 0) {
      console.log('\n   ⚠️  CÁC HOẠT ĐỘNG KHÔNG THUỘC LỚP (sẽ KHÔNG được hiển thị):');
      nonClassActivities.forEach((act, idx) => {
        console.log(`      ${idx + 1}. ${act.ten_hd} - Người tạo: ${act.nguoi_tao}`);
      });
    }
    
    // 5. Test API service với scope filter
    console.log('\n' + '='.repeat(100));
    console.log('🧪 TEST API SERVICE VỚI SCOPE FILTER:');
    console.log('='.repeat(100));
    
    const user = {
      sub: sinhVien.nguoi_dung_id,
      role: 'SINH_VIEN'
    };
    
    const scope = {
      classId: sinhVien.lop_id,
      className: sinhVien.lop?.ten_lop,
      activityFilter: {
        nguoi_tao_id: { in: classCreatorUserIds }
      }
    };
    
    const filters = {
      page: 1,
      limit: 100, // Lấy tất cả
      semester: 'hoc_ky_1-2025', // Format: hoc_ky_1-2025
      scope: scope
    };
    
    try {
      const result = await activitiesService.list(filters, user);
      
      console.log('\n✅ API RESPONSE:');
      console.log('   - Tổng số hoạt động:', result.total || result.items?.length || 0);
      console.log('   - Số hoạt động trong trang:', result.items?.length || 0);
      console.log('   - Trang hiện tại:', result.page || 1);
      console.log('   - Tổng số trang:', result.totalPages || 1);
      
      if (result.items && result.items.length > 0) {
        console.log('\n   📋 CHI TIẾT HOẠT ĐỘNG:');
        result.items.forEach((act, idx) => {
          console.log(`      ${idx + 1}. ${act.ten_hd || act.ten_hd}`);
          console.log(`         - ID: ${act.id || act.hd_id}`);
          console.log(`         - Trạng thái: ${act.trang_thai || 'N/A'}`);
          console.log(`         - Điểm: ${act.diem_rl || 0}`);
          console.log(`         - Loại: ${act.loai_hd?.ten_loai_hd || act.loai || 'N/A'}`);
          console.log(`         - Ngày bắt đầu: ${act.ngay_bd || 'N/A'}`);
        });
      }
      
      // So sánh với dữ liệu thực tế
      console.log('\n📊 SO SÁNH:');
      console.log('   - Hoạt động thuộc lớp (từ DB):', classActivities.length);
      console.log('   - Hoạt động API trả về:', result.items?.length || 0);
      
      if (classActivities.length === (result.items?.length || 0)) {
        console.log('   ✅ KHỚP!');
      } else {
        console.log(`   ⚠️  CHÊNH LỆCH: ${Math.abs(classActivities.length - (result.items?.length || 0))} hoạt động`);
      }
      
    } catch (err) {
      console.error('❌ Error calling API service:', err.message);
      console.error(err.stack);
    }
    
    // 6. Kiểm tra đăng ký của sinh viên
    console.log('\n' + '='.repeat(100));
    console.log('📝 KIỂM TRA ĐĂNG KÝ CỦA SINH VIÊN:');
    console.log('='.repeat(100));
    
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sinhVien.id,
        hoat_dong: {
          hoc_ky: 'hoc_ky_1',
          nam_hoc: '2025-2026',
          nguoi_tao_id: { in: classCreatorUserIds }
        }
      },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            trang_thai: true
          }
        }
      }
    });
    
    console.log('\n   - Tổng số đăng ký:', registrations.length);
    
    const regsByStatus = {};
    registrations.forEach(reg => {
      const status = reg.trang_thai_dk;
      if (!regsByStatus[status]) {
        regsByStatus[status] = [];
      }
      regsByStatus[status].push(reg);
    });
    
    console.log('\n   - Phân loại theo trạng thái:');
    Object.entries(regsByStatus).forEach(([status, regs]) => {
      console.log(`      + ${status}: ${regs.length}`);
    });
    
    // 7. Tóm tắt
    console.log('\n' + '='.repeat(100));
    console.log('📊 TÓM TẮT:');
    console.log('='.repeat(100));
    console.log(`   - Tổng hoạt động HK1 2025-2026: ${allActivities.length}`);
    console.log(`   - Hoạt động thuộc lớp: ${classActivities.length}`);
    console.log(`   - Hoạt động không thuộc lớp: ${nonClassActivities.length}`);
    console.log(`   - Đăng ký của sinh viên: ${registrations.length}`);
    console.log(`   - Dashboard hiển thị: 20 hoạt động (từ hình ảnh)`);
    
    if (classActivities.length === 20) {
      console.log('\n   ✅ SỐ LƯỢNG KHỚP VỚI DASHBOARD!');
    } else {
      console.log(`\n   ⚠️  CHÊNH LỆCH: Dashboard hiển thị 20, DB có ${classActivities.length}`);
      console.log('   💡 Có thể do:');
      console.log('      - Dashboard đang cache dữ liệu cũ');
      console.log('      - Có filter khác (trạng thái, loại, v.v.)');
      console.log('      - Có hoạt động từ học kỳ khác được hiển thị');
    }
    
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

checkActivitiesList();

