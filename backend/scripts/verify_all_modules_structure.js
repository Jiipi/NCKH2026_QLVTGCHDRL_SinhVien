/**
 * Kiểm tra cấu trúc tất cả modules xem có đủ files không
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra cấu trúc tất cả modules...\n');

const modulesDir = path.resolve(__dirname, '..', 'src', 'modules');
const modules = fs.readdirSync(modulesDir).filter(item => {
  const fullPath = path.join(modulesDir, item);
  return fs.statSync(fullPath).isDirectory();
});

const results = {
  complete: [],
  missingService: [],
  missingRepo: [],
  missingRoutes: []
};

modules.forEach(moduleName => {
  const modulePath = path.join(modulesDir, moduleName);
  const files = fs.readdirSync(modulePath);
  
  const hasService = files.some(f => f.includes('.service.js') && !f.includes('services/'));
  const hasRepo = files.some(f => f.includes('.repo.js') && !f.includes('repositories/'));
  const hasRoutes = files.some(f => f.includes('routes.js') || f.includes('.routes.js'));
  
  const status = {
    module: moduleName,
    hasService,
    hasRepo,
    hasRoutes
  };
  
  if (hasService && hasRepo && hasRoutes) {
    results.complete.push(status);
  } else {
    if (!hasService) results.missingService.push(moduleName);
    if (!hasRepo) results.missingRepo.push(moduleName);
    if (!hasRoutes) results.missingRoutes.push(moduleName);
  }
});

console.log('='.repeat(80));
console.log('📊 KẾT QUẢ KIỂM TRA CẤU TRÚC MODULES');
console.log('='.repeat(80));

console.log(`\n✅ Modules đầy đủ (có service, repo, routes): ${results.complete.length}`);
results.complete.forEach(m => {
  console.log(`   ✓ ${m.module}`);
});

if (results.missingService.length > 0) {
  console.log(`\n⚠️  Modules thiếu service: ${results.missingService.length}`);
  results.missingService.forEach(m => {
    console.log(`   ⚠️  ${m}`);
  });
}

if (results.missingRepo.length > 0) {
  console.log(`\n⚠️  Modules thiếu repo: ${results.missingRepo.length}`);
  results.missingRepo.forEach(m => {
    console.log(`   ⚠️  ${m}`);
  });
}

if (results.missingRoutes.length > 0) {
  console.log(`\n⚠️  Modules thiếu routes: ${results.missingRoutes.length}`);
  results.missingRoutes.forEach(m => {
    console.log(`   ⚠️  ${m}`);
  });
}

// Chi tiết từng module
console.log(`\n📋 Chi tiết từng module:`);
modules.forEach(moduleName => {
  const modulePath = path.join(modulesDir, moduleName);
  const files = fs.readdirSync(modulePath);
  
  const hasService = files.some(f => f.includes('.service.js') && !f.includes('services/'));
  const hasRepo = files.some(f => f.includes('.repo.js') && !f.includes('repositories/'));
  const hasRoutes = files.some(f => f.includes('routes.js') || f.includes('.routes.js'));
  
  const status = [];
  if (hasService) status.push('service');
  if (hasRepo) status.push('repo');
  if (hasRoutes) status.push('routes');
  
  const icon = (hasService && hasRepo && hasRoutes) ? '✅' : '⚠️';
  console.log(`   ${icon} ${moduleName}: ${status.join(', ') || 'không có'}`);
});

console.log('\n' + '='.repeat(80));
console.log('📊 TỔNG KẾT');
console.log('='.repeat(80));

const total = modules.length;
const complete = results.complete.length;
const incomplete = total - complete;

console.log(`\n✅ Modules đầy đủ: ${complete}/${total}`);
console.log(`⚠️  Modules thiếu files: ${incomplete}/${total}`);

if (incomplete === 0) {
  console.log('\n🎉 Tất cả modules đều đầy đủ!');
  process.exit(0);
} else {
  console.log('\n⚠️  Còn một số modules thiếu files.');
  process.exit(1);
}

