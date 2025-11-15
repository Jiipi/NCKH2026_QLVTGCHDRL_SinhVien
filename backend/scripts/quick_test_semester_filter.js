/**
 * Script test nhanh để kiểm tra filter học kỳ
 */

const { buildRobustActivitySemesterWhere, parseSemesterString } = require('../src/core/utils/semester');

function testFilter(semesterStr) {
  console.log(`\n🔍 Testing semester: ${semesterStr}`);
  
  const semesterInfo = parseSemesterString(semesterStr);
  console.log('   Semester info:', semesterInfo);
  
  const filter = buildRobustActivitySemesterWhere(semesterStr);
  console.log('   Filter structure:');
  console.log(JSON.stringify(filter, null, 2));
  
  // Simulate how it's used in repository
  const hoatDongWhere = filter && Object.keys(filter).length > 0
    ? {
        AND: [
          filter, // Semester filter (contains OR)
          { trang_thai: { in: ['da_duyet', 'ket_thuc'] } }
        ]
      }
    : { trang_thai: { in: ['da_duyet', 'ket_thuc'] } };
  
  console.log('\n   Final where clause for hoat_dong:');
  console.log(JSON.stringify(hoatDongWhere, null, 2));
  
  return hoatDongWhere;
}

// Test cases
console.log('='.repeat(60));
console.log('KIỂM TRA FILTER HỌC KỲ');
console.log('='.repeat(60));

testFilter('hoc_ky_1-2025');
testFilter('hoc_ky_2-2024');
testFilter('current');

console.log('\n✅ Test hoàn thành!\n');

