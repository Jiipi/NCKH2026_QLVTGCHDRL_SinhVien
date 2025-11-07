# ✅ TEST CHECKLIST - Class Access Control

## 🎯 Mục tiêu test:
Đảm bảo sinh viên/lớp trưởng/GVCN CHỈ thấy và đăng ký hoạt động trong lớp của mình.

---

## 📋 Pre-requisites:

### 1. Start Backend:
```powershell
cd backend
npm run dev
# hoặc
node src/index.js
```

### 2. Start Frontend:
```powershell
cd frontend
npm start
```

### 3. Test Accounts:
- [ ] Sinh viên Lớp A: `SV000001` / password
- [ ] Sinh viên Lớp B: `SV000002` / password  
- [ ] Lớp trưởng: `SV000013` / password
- [ ] GVCN: (teacher account) / password
- [ ] Admin: `admin` / password

---

## 🧪 Test Cases:

### Test 1: Sinh viên chỉ thấy hoạt động lớp mình ✅

**Steps:**
1. Login as Sinh viên Lớp A (`SV000001`)
2. Navigate to `/student/activities`
3. Open DevTools Console
4. Check logs

**Expected:**
```javascript
// Console log:
📊 Filtered activities: {
  total: 10,
  inClass: 5,      // ← Chỉ hoạt động lớp A
  outClass: 5,     // ← Đã bị filter
  filteredCount: 5 // ← Chỉ hiển thị 5
}
```

**Backend log:**
```
🔍 User role: sinh_vien
🔍 Lop ID: 1
✅ Filter by nguoi_tao_id (class members + homeroom teacher): 15 creators
```

**Status**: [ ]

---

### Test 2: Sinh viên KHÔNG thể đăng ký hoạt động ngoài lớp ❌

**Steps:**
1. Login as Sinh viên Lớp A
2. Lấy ID hoạt động của Lớp B (from database or API)
3. Try to register via API:
```javascript
// Browser DevTools Console:
fetch('http://localhost:5000/api/activities/{id_lop_B}/register', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log);
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Bạn chỉ có thể đăng ký hoạt động trong lớp của mình",
  "statusCode": 403
}
```

**Status**: [ ]

---

### Test 3: Dashboard chỉ hiển thị hoạt động lớp mình ✅

**Steps:**
1. Login as Sinh viên
2. Navigate to `/student/dashboard`
3. Check "Hoạt động gần đây" section

**Expected:**
- Chỉ thấy hoạt động do lớp mình tạo
- Không có hoạt động lớp khác
- Console log:
```javascript
🔍 My Activities semester filter: { semester: "hoc_ky_1-2024", ... }
📊 Class activities filter applied
```

**Status**: [ ]

---

### Test 4: Lớp trưởng có quyền tương tự sinh viên ✅

**Steps:**
1. Login as Lớp trưởng (`SV000013`)
2. Navigate to `/student/activities`
3. Check activities list

**Expected:**
- Chỉ thấy hoạt động lớp mình
- Backend log:
```
🔍 Lop truong User ID: xxx
🔍 Lop truong Lop ID: 1
✅ Lop truong - showing ALL statuses
```

**Status**: [ ]

---

### Test 5: GVCN chỉ thấy hoạt động lớp phụ trách 👨‍🏫

**Steps:**
1. Login as GVCN
2. Navigate to teacher dashboard
3. Check activities list

**Expected:**
- Chỉ thấy hoạt động của lớp mình phụ trách
- Backend log:
```
🔍 Teacher scoped OR filter: [
  { nguoi_tao_id: { in: [students, teacher_id] } }
]
```

**Status**: [ ]

---

### Test 6: Admin có full access 👑

**Steps:**
1. Login as Admin
2. Navigate to `/admin/activities`
3. Check activities list

**Expected:**
- Thấy TẤT CẢ hoạt động của tất cả lớp
- Backend log:
```
🔍 Other role (likely admin), showing all activities
```

**Status**: [ ]

---

### Test 7: Frontend không leak hoạt động ngoài lớp 🔒

**Steps:**
1. Login as Sinh viên Lớp A
2. Open DevTools → Network tab
3. Navigate to `/student/activities`
4. Check API response

**Expected:**
```json
GET /api/activities?semester=...
Response: {
  "data": {
    "items": [
      { "id": 1, "is_class_activity": true, ... },
      { "id": 2, "is_class_activity": true, ... }
      // NO items with is_class_activity: false
    ]
  }
}
```

**Status**: [ ]

---

### Test 8: Tính điểm chỉ từ hoạt động lớp 📊

**Steps:**
1. Login as Sinh viên
2. Navigate to dashboard
3. Check "Tổng điểm" card
4. Open Console

**Expected Console Log:**
```javascript
// DashboardStudentModern.js
Filtering class activities only: true
Class activities count: 5
Participated in class activities: 3
Total points from class: 25
```

**Status**: [ ]

---

## 🔍 Database Verification:

### Check 1: Hoạt động trong database
```sql
-- Backend terminal
cd backend
npx prisma studio

-- Or direct query:
SELECT 
  hd.id, 
  hd.ten_hd,
  nd.ho_ten as nguoi_tao,
  sv.lop_id,
  l.ten_lop
FROM hoat_dong hd
LEFT JOIN nguoi_dung nd ON hd.nguoi_tao_id = nd.id
LEFT JOIN sinh_vien sv ON nd.id = sv.nguoi_dung_id
LEFT JOIN lop l ON sv.lop_id = l.id
ORDER BY hd.ngay_tao DESC;
```

**Expected:**
- Các hoạt động có nguoi_tao_id thuộc lớp cụ thể
- Mỗi hoạt động chỉ visible cho sinh viên trong lớp đó

**Status**: [ ]

---

### Check 2: Đăng ký hoạt động
```sql
SELECT 
  dk.id,
  sv.mssv,
  l.ten_lop as lop_sinh_vien,
  hd.ten_hd,
  nd.ho_ten as nguoi_tao_hd,
  dk.trang_thai_dk
FROM dang_ky_hoat_dong dk
JOIN sinh_vien sv ON dk.sv_id = sv.id
JOIN lop l ON sv.lop_id = l.id
JOIN hoat_dong hd ON dk.hd_id = hd.id
JOIN nguoi_dung nd ON hd.nguoi_tao_id = nd.id
ORDER BY dk.ngay_dang_ky DESC
LIMIT 20;
```

**Expected:**
- Không có đăng ký cross-class sau khi apply rule
- Tất cả đăng ký đều thuộc cùng lớp

**Status**: [ ]

---

## 🐛 Common Issues & Solutions:

### Issue 1: Frontend vẫn hiển thị hoạt động ngoài lớp
**Solution:**
- Check backend response có field `is_class_activity`
- Check frontend filter logic:
```javascript
// ActivitiesListModern.js line 128
const filtered = items.filter(activity => 
  activity.is_class_activity === true
);
```

### Issue 2: 403 error khi đăng ký hoạt động trong lớp
**Solution:**
- Check middleware `canRegisterActivity` có được apply đúng
- Check classCreators logic trong middleware
- Check backend logs

### Issue 3: Backend không trả về is_class_activity
**Solution:**
- Check activities.route.js line 508
- Verify classCreators được tính đúng
- Check role detection logic

### Issue 4: GVCN không thấy hoạt động
**Solution:**
- Check lop.chu_nhiem có đúng user_id
- Check teacher role detection
- Verify getTeacherClasses logic

---

## 📊 Success Criteria:

✅ **Backend:**
- [ ] Middleware blocks registration outside class (403)
- [ ] GET /activities filters by classCreators
- [ ] Dashboard returns only class activities
- [ ] Backend logs show correct filters

✅ **Frontend:**
- [ ] Activities list shows only class activities
- [ ] Dashboard displays only class activities
- [ ] Console logs show correct filtering
- [ ] Network tab shows filtered responses

✅ **Security:**
- [ ] Cannot bypass via URL manipulation
- [ ] Cannot bypass via API calls
- [ ] Cannot see other class data in responses
- [ ] Middleware catches all registration attempts

---

## 📝 Test Report Template:

```markdown
### Test Run: [Date/Time]
**Tester**: [Your Name]
**Environment**: Dev/Staging

#### Results:
- Test 1 (Sinh viên filter): PASS/FAIL
- Test 2 (Registration block): PASS/FAIL
- Test 3 (Dashboard filter): PASS/FAIL
- Test 4 (Lớp trưởng): PASS/FAIL
- Test 5 (GVCN): PASS/FAIL
- Test 6 (Admin): PASS/FAIL
- Test 7 (No leak): PASS/FAIL
- Test 8 (Points calc): PASS/FAIL

#### Issues Found:
1. [Describe issue]
2. [Describe issue]

#### Screenshots:
[Attach screenshots if needed]

#### Conclusion:
READY FOR PRODUCTION / NEEDS FIXES
```

---

**Created**: 2024-11-06  
**Priority**: 🔴 HIGH  
**Status**: ⏳ Ready to test
