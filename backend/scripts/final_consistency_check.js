/**
 * Kiểm tra tính nhất quán của tất cả modules
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra tính nhất quán của tất cả modules...\n');

const modulesDir = path.resolve(__dirname, '..', 'src', 'modules');
const modules = fs.readdirSync(modulesDir).filter(item => {
  const fullPath = path.join(modulesDir, item);
  return fs.statSync(fullPath).isDirectory();
});

const results = {
  consistent: [],
  inconsistent: [],
  missingFiles: [],
  namingIssues: []
};

modules.forEach(moduleName => {
  const modulePath = path.join(modulesDir, moduleName);
  const files = fs.readdirSync(modulePath);
  
  // Kiểm tra files
  const hasService = files.some(f => f === `${moduleName}.service.js` || f.includes('.service.js'));
  const hasRepo = files.some(f => f === `${moduleName}.repo.js` || f.includes('.repo.js'));
  const hasRoutes = files.some(f => f === `${moduleName}.routes.js` || f.includes('routes.js'));
  const hasIndex = files.includes('index.js');
  
  // Kiểm tra naming convention
  const serviceFile = files.find(f => f.includes('.service.js'));
  const repoFile = files.find(f => f.includes('.repo.js'));
  const routesFile = files.find(f => f.includes('routes.js'));
  
  const namingIssues = [];
  if (serviceFile && serviceFile !== `${moduleName}.service.js`) {
    namingIssues.push(`Service: ${serviceFile} (expected: ${moduleName}.service.js)`);
  }
  if (repoFile && repoFile !== `${moduleName}.repo.js`) {
    namingIssues.push(`Repo: ${repoFile} (expected: ${moduleName}.repo.js)`);
  }
  if (routesFile && routesFile !== `${moduleName}.routes.js`) {
    namingIssues.push(`Routes: ${routesFile} (expected: ${moduleName}.routes.js)`);
  }
  
  // Kiểm tra infrastructure
  const hasInfrastructure = fs.existsSync(path.join(modulePath, 'infrastructure'));
  const hasApplication = fs.existsSync(path.join(modulePath, 'application'));
  const hasPresentation = fs.existsSync(path.join(modulePath, 'presentation'));
  const hasDomain = fs.existsSync(path.join(modulePath, 'domain'));
  
  // Phân loại module
  const isCleanArchitecture = hasApplication && hasInfrastructure && hasPresentation;
  const isServiceLayer = hasService && hasRepo;
  
  const status = {
    module: moduleName,
    hasService,
    hasRepo,
    hasRoutes,
    hasIndex,
    serviceFile: serviceFile || null,
    repoFile: repoFile || null,
    routesFile: routesFile || null,
    namingIssues,
    isCleanArchitecture,
    isServiceLayer,
    hasInfrastructure,
    hasApplication,
    hasPresentation,
    hasDomain
  };
  
  // Đánh giá nhất quán
  let isConsistent = true;
  const issues = [];
  
  // Modules dùng Clean Architecture không cần service/repo ở root
  if (isCleanArchitecture && !hasService && !hasRepo) {
    // OK - Clean Architecture
  } else if (isServiceLayer) {
    // Modules có service layer cần có đủ files
    if (!hasService) {
      issues.push('Thiếu service file');
      isConsistent = false;
    }
    if (!hasRepo) {
      issues.push('Thiếu repo file');
      isConsistent = false;
    }
  }
  
  // Tất cả modules cần có routes
  if (!hasRoutes) {
    issues.push('Thiếu routes file');
    isConsistent = false;
  }
  
  // Kiểm tra naming
  if (namingIssues.length > 0) {
    issues.push(`Naming issues: ${namingIssues.join(', ')}`);
    isConsistent = false;
  }
  
  if (isConsistent) {
    results.consistent.push(status);
  } else {
    results.inconsistent.push({ ...status, issues });
  }
  
  if (namingIssues.length > 0) {
    results.namingIssues.push({ module: moduleName, issues: namingIssues });
  }
});

console.log('='.repeat(80));
console.log('📊 KẾT QUẢ KIỂM TRA TÍNH NHẤT QUÁN');
console.log('='.repeat(80));

console.log(`\n✅ Modules nhất quán: ${results.consistent.length}/${modules.length}`);
results.consistent.forEach(m => {
  const type = m.isCleanArchitecture ? 'Clean Architecture' : 'Service Layer';
  console.log(`   ✓ ${m.module} (${type})`);
});

if (results.inconsistent.length > 0) {
  console.log(`\n⚠️  Modules không nhất quán: ${results.inconsistent.length}/${modules.length}`);
  results.inconsistent.forEach(m => {
    console.log(`   ⚠️  ${m.module}:`);
    m.issues.forEach(issue => {
      console.log(`      - ${issue}`);
    });
  });
}

if (results.namingIssues.length > 0) {
  console.log(`\n⚠️  Modules có vấn đề về naming: ${results.namingIssues.length}`);
  results.namingIssues.forEach(m => {
    console.log(`   ⚠️  ${m.module}:`);
    m.issues.forEach(issue => {
      console.log(`      - ${issue}`);
    });
  });
}

// Chi tiết từng module
console.log(`\n📋 Chi tiết từng module:`);
modules.forEach(moduleName => {
  const modulePath = path.join(modulesDir, moduleName);
  const files = fs.readdirSync(modulePath);
  
  const hasService = files.some(f => f === `${moduleName}.service.js` || f.includes('.service.js'));
  const hasRepo = files.some(f => f === `${moduleName}.repo.js` || f.includes('.repo.js'));
  const hasRoutes = files.some(f => f === `${moduleName}.routes.js` || f.includes('routes.js'));
  const hasIndex = files.includes('index.js');
  
  const serviceFile = files.find(f => f.includes('.service.js'));
  const repoFile = files.find(f => f.includes('.repo.js'));
  const routesFile = files.find(f => f.includes('routes.js'));
  
  const hasInfrastructure = fs.existsSync(path.join(modulePath, 'infrastructure'));
  const hasApplication = fs.existsSync(path.join(modulePath, 'application'));
  
  const type = hasApplication ? 'Clean Architecture' : 'Service Layer';
  
  const status = [];
  if (hasService) status.push(`service:${serviceFile || '✓'}`);
  if (hasRepo) status.push(`repo:${repoFile || '✓'}`);
  if (hasRoutes) status.push(`routes:${routesFile || '✓'}`);
  if (hasIndex) status.push('index');
  
  const icon = (hasService && hasRepo && hasRoutes) || (hasApplication && hasRoutes) ? '✅' : '⚠️';
  console.log(`   ${icon} ${moduleName} (${type}): ${status.join(', ') || 'không có'}`);
});

console.log('\n' + '='.repeat(80));
console.log('📊 TỔNG KẾT');
console.log('='.repeat(80));

const total = modules.length;
const consistent = results.consistent.length;
const inconsistent = total - consistent;

console.log(`\n✅ Modules nhất quán: ${consistent}/${total}`);
console.log(`⚠️  Modules không nhất quán: ${inconsistent}/${total}`);

if (inconsistent === 0) {
  console.log('\n🎉 Tất cả modules đều nhất quán!');
  process.exit(0);
} else {
  console.log('\n⚠️  Còn một số modules chưa nhất quán.');
  process.exit(1);
}

