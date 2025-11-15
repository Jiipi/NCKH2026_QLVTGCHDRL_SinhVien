// Script to fix all wrong import names in route files
const fs = require('fs');
const path = require('path');

// Mapping from wrong names to correct names from lazyComponents.js
const importMapping = {
  'AdminActivities': 'AdminActivitiesPage',
  'AdminRoles': 'AdminRolesPage',
  'ManageActivity': 'ManageActivityPage',
  'AdminRegistrations': 'AdminApprovalsPage',
  'AdminReports': 'AdminReportsPage',
  'AdminNotifications': 'AdminNotificationsPage',
  'AdminQRAttendance': 'AdminQRAttendancePage',
  'ActivityTypeManagement': 'ActivityTypeManagementPage',
  'SemesterManagement': 'SemesterManagementPage',
  'AdminSettings': 'AdminSettingsPage',
  'AdminProfile': 'AdminProfilePage',
  'MonitorMyProfile': 'MonitorProfilePage',
  'MonitorMyCertificates': 'StudentCertificatesPage',
  'ClassStudents': 'ClassStudentsPage',
  'ClassReports': 'MonitorReportsPage',
  'ClassNotifications': 'MonitorNotificationsPage',
  'Scores': 'StudentScoresPage',
  'StudentProfile': 'StudentProfilePage',
  'ModernTeacherDashboard': 'TeacherDashboardPage',
  'TeacherActivities': 'TeacherActivitiesPage',
  'ModernActivityApproval': 'TeacherActivityApprovalPage',
  'TeacherRegistrationApprovals': 'TeacherRegistrationApprovalPage',
  'ModernStudentManagement': 'StudentManagementPage',
  'ImportStudents': 'ImportStudentsPage',
  'ModernNotifications': 'TeacherNotificationsPage',
  'ModernReports': 'TeacherReportsPage',
  'TeacherProfile': 'TeacherProfilePage',
  'TeacherPreferences': 'TeacherPreferencesPage'
};

// Files to fix
const routeFiles = [
  'src/app/routes/AdminRoutes.js',
  'src/app/routes/MonitorRoutes.js',
  'src/app/routes/StudentRoutes.js',
  'src/app/routes/TeacherRoutes.js'
];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  Object.entries(importMapping).forEach(([wrong, correct]) => {
    const regex = new RegExp(`LazyComponents\\.${wrong}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `LazyComponents.${correct}`);
      changed = true;
      console.log(`${file}: ${wrong} → ${correct}`);
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
  } else {
    console.log(`⏭️  No changes needed for ${file}`);
  }
});

console.log('\n✅ Done! All route files fixed.');
