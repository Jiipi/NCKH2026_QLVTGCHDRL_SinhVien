const fs = require('fs');
const path = require('path');

/**
 * Script để tự động thêm userRole parameter vào tất cả các lệnh gọi 
 * enforceWritableForUserSemesterOrThrow trong activities.route.js
 */

const filePath = path.join(__dirname, '../src/routes/activities.route.js');

console.log('🔧 Đang sửa file activities.route.js...\n');

let content = fs.readFileSync(filePath, 'utf8');
let changeCount = 0;

// Pattern để tìm các lệnh gọi enforceWritableForUserSemesterOrThrow
const pattern = /await SemesterClosure\.enforceWritableForUserSemesterOrThrow\(\{\s*userId:\s*req\.user\.sub,\s*hoc_ky:\s*([^,}]+),\s*nam_hoc:\s*([^}]+)\s*\}\);/g;

// Replace với version có userRole
content = content.replace(pattern, (match, hocKy, namHoc) => {
  changeCount++;
  return `await SemesterClosure.enforceWritableForUserSemesterOrThrow({ userId: req.user.sub, hoc_ky: ${hocKy}, nam_hoc: ${namHoc}, userRole: req.user?.role });`;
});

// Save file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Đã sửa ${changeCount} lệnh gọi trong activities.route.js`);
console.log('✅ Hoàn tất!\n');
