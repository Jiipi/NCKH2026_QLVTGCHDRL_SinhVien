# Semester Format Normalization

## Tổng quan

Chuẩn hóa định dạng học kỳ từ `hoc_ky_X-YYYY` (dash) sang `hoc_ky_X_YYYY` (underscore) để thống nhất trên toàn hệ thống.

## Format mới

```
hoc_ky_1_2025  (Học kỳ 1 năm 2025)
hoc_ky_2_2025  (Học kỳ 2 năm 2025)
```

## Tương thích ngược

Tất cả các hàm đều hỗ trợ cả 2 format:
- `hoc_ky_1-2025` (legacy)
- `hoc_ky_1_2025` (new)

## Shared Utilities

### Frontend: `frontend/src/shared/lib/semester.js`

```javascript
import { 
  normalizeSemester,      // Convert any format to underscore
  buildSemesterValue,     // Build hoc_ky_X_YYYY from parts
  getCurrentSemesterValue, // Get current semester
  parseSemester           // Parse to { semester, year }
} from '../shared/lib/semester';
```

### Backend: `backend/src/core/utils/semester.js`

```javascript
const { 
  normalizeSemesterFormat,  // Convert any format to underscore
  buildSemesterValue,       // Build hoc_ky_X_YYYY from parts
  parseSemesterString,      // Parse to { semester, year }
  determineSemesterFromDate // Get semester from date
} = require('../../core/utils/semester');
```

## Files Updated

### Frontend (16 files)

1. **shared/lib/semester.js** - NEW: Central semester utilities
2. **shared/lib/index.js** - Export semester utilities
3. **shared/hooks/useSemesterData.js** - Simplified computeWritable
4. **features/admin/model/useAdminActivitiesList.js** - Use shared lib
5. **features/admin/model/useAdminRegistrations.js** - Use shared lib
6. **features/student/model/hooks/useStudentActivitiesList.js** - Use shared lib
7. **features/teacher/model/utils/teacherUtils.js** - Re-export from shared lib
8. **features/teacher/model/hooks/useTeacherActivityApprovalPage.js** - Use shared lib
9. **features/teacher/ui/TeacherReportsPage.js** - Use shared lib
10. **features/reports/teacher/model/useTeacherReports.js** - Use shared lib
11. **features/reports/monitor/model/useMonitorReports.js** - Use shared lib
12. **features/monitor/model/hooks/useMonitorReports.js** - Use shared lib
13. **features/monitor/model/hooks/useMonitorStudentManagement.js** - Use shared lib
14. **features/monitor/model/hooks/useMonitorApprovals.js** - Use shared lib
15. **features/classes/ui/ClassStudentsPage.js** - Use shared lib
16. **features/approvals/ui/TeacherActivityApprovalPage.js** - Use shared lib
17. **features/approvals/model/hooks/useAdminApprovals.js** - Use shared lib
18. **features/activities/model/utils/activityUtils.js** - Use shared lib
19. **features/activities/model/hooks/useManageActivity.js** - Use shared lib
20. **features/qr-attendance/ui/AdminQRAttendancePage.js** - Updated regex

### Backend (3 files)

1. **src/core/utils/semester.js** - Added normalizeSemesterFormat, buildSemesterValue
2. **src/modules/semesters/business/services/ActivateSemesterUseCase.js** - Use underscore format
3. **src/business/services/semesterClosure.service.js** - Handle both formats

## isWritable Logic (Simplified)

Trước đây logic `computeWritable` phức tạp (~60 lines), nay đơn giản hóa:

```javascript
function computeWritable(status, semesterValue, currentSemester) {
  const normalizedValue = normalizeSemester(semesterValue);
  const normalizedCurrent = normalizeSemester(currentSemester);
  return !semesterValue || normalizedValue === normalizedCurrent;
}
```

- `isWritable = true` khi học kỳ được chọn trùng với học kỳ hiện tại (active)
- Đơn giản, rõ ràng, dễ bảo trì

## Lưu ý

1. **Backend** vẫn lưu trong DB ở format cũ nếu dữ liệu cũ, nhưng mọi comparison đều normalize trước
2. **Frontend** luôn generate format mới (underscore) cho các semester mới
3. **API responses** có thể trả về cả 2 format, client cần normalize trước khi compare

## Testing

```powershell
# Frontend
cd frontend
npm run build

# Backend  
cd backend
npm run test:integration
```

## Ngày cập nhật

2025-01-24
