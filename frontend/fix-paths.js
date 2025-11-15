// Script to fix all wrong import paths in features folder
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapping of wrong paths to correct paths
const pathReplacements = [
  // Wrong -> Correct
  { from: "'../../shared/services/api/client'", to: "'../../../shared/services/api/client'" },
  { from: "'../../contexts/NotificationContext'", to: "'../../../contexts/NotificationContext'" },
  { from: "'../../shared/store/useAppStore'", to: "'../../../shared/store/useAppStore'" },
  { from: "'../../shared/services/storage/sessionStorageManager'", to: "'../../../shared/services/storage/sessionStorageManager'" },
  { from: "'../../contexts/TabSessionContext'", to: "'../../../contexts/TabSessionContext'" },
  { from: "'../../utils/role'", to: "'../../../utils/role'" },
  { from: "'../../utils/avatarUtils'", to: "'../../../utils/avatarUtils'" },
  { from: "'../../utils/activityImages'", to: "'../../../utils/activityImages'" },
  { from: "'../../utils/apiNormalization'", to: "'../../../utils/apiNormalization'" },
  { from: "'../../utils/dateFormat'", to: "'../../../utils/dateFormat'" },
  { from: "'../../components/ActivityDetailModal'", to: "'../../../components/ActivityDetailModal'" },
  { from: "'../../components/ConfirmModal'", to: "'../../../components/ConfirmModal'" },
  { from: "'../../components/Toast'", to: "'../../../components/Toast'" },
  { from: "'../../components/SemesterFilter'", to: "'../../../components/SemesterFilter'" },
  { from: "'../../components/AvatarUpload'", to: "'../../../components/AvatarUpload'" },
  { from: "'../../components/SemesterClosureWidget'", to: "'../../../components/SemesterClosureWidget'" },
  { from: "'../../components/MobileOptimizedDashboard'", to: "'../../../components/MobileOptimizedDashboard'" },
  { from: "'../../hooks/useSemesterData'", to: "'../../../hooks/useSemesterData'" },
  { from: "'../../hooks/useDashboardData'", to: "'../../../hooks/useDashboardData'" },
  { from: "'../../services/http'", to: "'../../../services/http'" },
  // Features-specific corrections
  { from: "'../shared/services/api/client'", to: "'../../shared/services/api/client'" },
  { from: "'../components/ClassManagementLayout'", to: "'../../components/ClassManagementLayout'" },
  { from: "'../components/Header'", to: "'../../components/Header'" },
  { from: "'../hooks/useSemesterData'", to: "'../../hooks/useSemesterData'" },
  { from: "'../components/AdminStudentLayout'", to: "'../../components/AdminStudentLayout'" },
  { from: "'../shared/store/useAppStore'", to: "'../../shared/store/useAppStore'" },
  { from: "from '../../features/activities/pages/ClassActivitiesPage'", to: "from './ClassActivitiesPage'" },
  { from: "from '../../features/activities/hooks/useMyActivities'", to: "from '../hooks/useMyActivities'" },
  { from: "from '../../features/activities/components/MyActivityCard'", to: "from '../components/MyActivityCard'" },
  { from: "from '../../features/activities/components/RegistrationStatusTabs'", to: "from '../components/RegistrationStatusTabs'" },
  { from: "'../utils/activityImages'", to: "'../../utils/activityImages'" },
  { from: "'../../components/SemesterFilter'", to: "'../../../components/SemesterFilter'" }
];

// Find all JS files in features
const files = glob.sync('src/features/**/*.js', { cwd: __dirname });

console.log(`Found ${files.length} files to check\n`);

let totalChanges = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let fileChanges = 0;

  pathReplacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      const before = content;
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      if (content !== before) {
        changed = true;
        fileChanges++;
      }
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} (${fileChanges} changes)`);
    totalChanges += fileChanges;
  }
});

console.log(`\n✅ Done! Fixed ${totalChanges} import paths across ${files.length} files.`);
