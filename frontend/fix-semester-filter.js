// Fix remaining SemesterFilter imports
const fs = require('fs');
const path = require('path');

const files = [
  'src/features/users/pages/StudentScoresPage.js',
  'src/features/reports/pages/TeacherReportsPage.js',
  'src/features/reports/pages/AdminReportsPage.js',
  'src/features/dashboard/pages/StudentDashboardPage.js',
  'src/features/dashboard/pages/MonitorDashboardPage.js',
  'src/features/approvals/pages/TeacherActivityApprovalPage.js',
  'src/features/approvals/pages/TeacherRegistrationApprovalPage.js',
  'src/features/activities/components/TeacherActivityFilters.js',
  'src/features/activities/components/ActivityFilters.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      /'\.\.\/\.\.\/\.\.\/components\/SemesterFilter'/g,
      "'../../../shared/components/common/SemesterFilter'"
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  }
});

console.log('\n✅ All SemesterFilter imports fixed!');
