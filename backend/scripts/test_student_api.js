/**
 * Script test API để kiểm tra response thực tế
 * Giả lập request từ frontend để xem backend trả về gì
 * Usage: node scripts/test_student_api.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import dashboard service
const dashboardService = require('../src/modules/dashboard/dashboard.service');

async function testStudentAPI() {
  const mssv = '202101002';
  
  try {
    console.log('='.repeat(100));
    console.log('🧪 TEST API RESPONSE CHO SINH VIÊN:', mssv);
    console.log('='.repeat(100));
    
    // 1. Tìm user ID của sinh viên
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true
          }
        }
      }
    });
    
    if (!sinhVien) {
      console.error('❌ Không tìm thấy sinh viên');
      return;
    }
    
    const userId = sinhVien.nguoi_dung_id;
    console.log('\n👤 User ID:', userId);
    console.log('👤 Họ tên:', sinhVien.nguoi_dung.ho_ten);
    
    // 2. Test getStudentDashboard với semester filter
    console.log('\n📊 TEST 1: getStudentDashboard với semesterValue = "hoc_ky_1-2025"');
    console.log('-'.repeat(100));
    
    try {
      const dashboardData = await dashboardService.getStudentDashboard(userId, {
        semesterValue: 'hoc_ky_1-2025'
      });
      
      console.log('✅ Response received:');
      console.log('   - Tổng điểm:', dashboardData.tong_quan?.tong_diem);
      console.log('   - Tổng hoạt động:', dashboardData.tong_quan?.tong_hoat_dong);
      console.log('   - Hoạt động sắp tới:', dashboardData.hoat_dong_sap_toi?.length || 0);
      console.log('   - Hoạt động gần đây:', dashboardData.hoat_dong_gan_day?.length || 0);
      
      console.log('\n   📋 Chi tiết hoạt động gần đây:');
      (dashboardData.hoat_dong_gan_day || []).forEach((act, idx) => {
        console.log(`      ${idx + 1}. ${act.ten_hd} - Trạng thái: ${act.trang_thai}`);
      });
      
      console.log('\n   📋 Chi tiết hoạt động sắp tới:');
      (dashboardData.hoat_dong_sap_toi || []).forEach((act, idx) => {
        console.log(`      ${idx + 1}. ${act.ten_hd} - Ngày: ${act.ngay_bd}`);
      });
      
    } catch (err) {
      console.error('❌ Error:', err.message);
      console.error(err.stack);
    }
    
    // 3. Test getMyActivities với semester filter
    console.log('\n📝 TEST 2: getMyActivities với semesterValue = "hoc_ky_1-2025"');
    console.log('-'.repeat(100));
    
    try {
      const myActivities = await dashboardService.getMyActivities(userId, {
        semesterValue: 'hoc_ky_1-2025'
      });
      
      console.log('✅ Response received:');
      console.log('   - Tổng số hoạt động:', myActivities.length);
      
      // Phân loại theo trạng thái
      const byStatus = {
        cho_duyet: [],
        da_duyet: [],
        da_tham_gia: [],
        tu_choi: []
      };
      
      myActivities.forEach(act => {
        const status = act.trang_thai_dk || 'unknown';
        if (byStatus[status]) {
          byStatus[status].push(act);
        }
      });
      
      console.log('\n   📊 Phân loại theo trạng thái:');
      Object.entries(byStatus).forEach(([status, acts]) => {
        if (acts.length > 0) {
          console.log(`      - ${status}: ${acts.length}`);
        }
      });
      
      console.log('\n   📋 Chi tiết hoạt động:');
      myActivities.forEach((act, idx) => {
        console.log(`      ${idx + 1}. ${act.ten_hd}`);
        console.log(`         - Trạng thái: ${act.trang_thai_dk}`);
        console.log(`         - Điểm: ${act.hoat_dong?.diem_rl || 0}`);
        console.log(`         - Loại: ${act.hoat_dong?.loai || 'N/A'}`);
        console.log(`         - is_class_activity: ${act.is_class_activity}`);
      });
      
      // Kiểm tra xem có hoạt động nào không thuộc lớp không
      const nonClassActivities = myActivities.filter(act => !act.is_class_activity);
      if (nonClassActivities.length > 0) {
        console.log('\n   ⚠️  VẤN ĐỀ: Có hoạt động không thuộc lớp trong response!');
        nonClassActivities.forEach(act => {
          console.log(`      - ${act.ten_hd}`);
        });
      } else {
        console.log('\n   ✅ Tất cả hoạt động đều thuộc lớp (is_class_activity = true)');
      }
      
    } catch (err) {
      console.error('❌ Error:', err.message);
      console.error(err.stack);
    }
    
    // 4. Test getMyActivities KHÔNG có semester filter
    console.log('\n📝 TEST 3: getMyActivities KHÔNG có semester filter');
    console.log('-'.repeat(100));
    
    try {
      const myActivitiesNoFilter = await dashboardService.getMyActivities(userId, {});
      
      console.log('✅ Response received:');
      console.log('   - Tổng số hoạt động:', myActivitiesNoFilter.length);
      
      // Kiểm tra xem có hoạt động nào không thuộc lớp không
      const nonClassActivities2 = myActivitiesNoFilter.filter(act => !act.is_class_activity);
      if (nonClassActivities2.length > 0) {
        console.log('\n   ⚠️  VẤN ĐỀ: Có hoạt động không thuộc lớp trong response!');
        nonClassActivities2.forEach(act => {
          console.log(`      - ${act.ten_hd}`);
        });
      } else {
        console.log('\n   ✅ Tất cả hoạt động đều thuộc lớp (is_class_activity = true)');
      }
      
    } catch (err) {
      console.error('❌ Error:', err.message);
      console.error(err.stack);
    }
    
    // 5. So sánh với dữ liệu thực tế
    console.log('\n📊 TEST 4: So sánh với dữ liệu thực tế trong DB');
    console.log('-'.repeat(100));
    
    const allRegs = await prisma.dangKyHoatDong.findMany({
      where: { sv_id: sinhVien.id },
      include: {
        hoat_dong: {
          select: {
            id: true,
            ten_hd: true,
            nguoi_tao_id: true,
            hoc_ky: true,
            nam_hoc: true
          }
        }
      }
    });
    
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: sinhVien.lop_id },
      select: { nguoi_dung_id: true }
    });
    
    const classCreatorIds = classStudents.map(s => s.nguoi_dung_id);
    const lop = await prisma.lop.findUnique({
      where: { id: sinhVien.lop_id },
      select: { chu_nhiem: true }
    });
    if (lop?.chu_nhiem) {
      classCreatorIds.push(lop.chu_nhiem);
    }
    
    const classRegs = allRegs.filter(r => classCreatorIds.includes(r.hoat_dong.nguoi_tao_id));
    const nonClassRegs = allRegs.filter(r => !classCreatorIds.includes(r.hoat_dong.nguoi_tao_id));
    
    console.log('   - Tổng đăng ký trong DB:', allRegs.length);
    console.log('   - Đăng ký hoạt động lớp:', classRegs.length);
    console.log('   - Đăng ký hoạt động không lớp:', nonClassRegs.length);
    
    if (nonClassRegs.length > 0) {
      console.log('\n   ⚠️  Các đăng ký không thuộc lớp trong DB:');
      nonClassRegs.forEach(reg => {
        console.log(`      - ${reg.hoat_dong.ten_hd} (${reg.hoat_dong.hoc_ky} ${reg.hoat_dong.nam_hoc})`);
      });
      console.log('\n   💡 Backend sẽ filter và KHÔNG trả về các đăng ký này');
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ TEST HOÀN TẤT');
    console.log('='.repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentAPI();

