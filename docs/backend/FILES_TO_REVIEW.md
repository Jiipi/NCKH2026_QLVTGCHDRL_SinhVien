# Danh sách các file .js dư thừa trong backend/src

## 📋 Tổng hợp

Sau khi quét toàn bộ thư mục `backend/src`, tôi đã tìm thấy các file có thể dư thừa sau khi refactor theo Clean Architecture và SOLID principles.

---

## 🗑️ CÁC FILE DƯ THỪA (CÓ THỂ XÓA)

### 1. **routes/index.js**
- **Vị trí**: `backend/src/routes/index.js`
- **Lý do**: File này không được import ở bất kỳ đâu. Tất cả routes được load từ `app/routes.js`
- **Kiểm tra**: ✅ Không có file nào import `routes/index.js`

### 2. **models/auth.model.js**
- **Vị trí**: `backend/src/models/auth.model.js`
- **Lý do**: Không được import ở đâu cả. Các chức năng auth đã được chuyển sang module mới
- **Kiểm tra**: ✅ Không có file nào import `models/auth.model.js`

### 3. **models/user.model.js**
- **Vị trí**: `backend/src/models/user.model.js`
- **Lý do**: Không được import ở đâu cả. Các chức năng user đã được chuyển sang module mới
- **Kiểm tra**: ✅ Không có file nào import `models/user.model.js`

### 4. **app/errors/AppError.js**
- **Vị trí**: `backend/src/app/errors/AppError.js`
- **Lý do**: Tất cả code đều sử dụng `core/errors/AppError.js` thay vì file này
- **Kiểm tra**: ✅ Không có file nào import `app/errors/AppError.js`

### 5. **app/policies/index.js**
- **Vị trí**: `backend/src/app/policies/index.js`
- **Lý do**: Tất cả code đều sử dụng `core/policies` thay vì file này
- **Kiểm tra**: ✅ Không có file nào import `app/policies`

---

## ⚠️ CÁC FILE LEGACY (CẦN XEM XÉT)

### 6. **modules/activities/activities.controller.js**
- **Vị trí**: `backend/src/modules/activities/activities.controller.js`
- **Tình trạng**: Chỉ được export trong `index.js`, nhưng routes mới sử dụng `presentation/ActivitiesController.js`
- **Lưu ý**: File này có thể được giữ lại để backward compatibility hoặc xóa nếu không cần

### 7. **modules/auth/auth.controller.js**
- **Vị trí**: `backend/src/modules/auth/auth.controller.js`
- **Tình trạng**: Chỉ được export trong `index.js`, nhưng routes mới sử dụng `presentation/AuthController.js`
- **Lưu ý**: File này có thể được giữ lại để backward compatibility hoặc xóa nếu không cần

### 8. **modules/users/users.controller.js**
- **Vị trí**: `backend/src/modules/users/users.controller.js`
- **Tình trạng**: Chỉ được export trong `index.js`, nhưng routes mới sử dụng `presentation/UsersController.js`
- **Lưu ý**: File này có thể được giữ lại để backward compatibility hoặc xóa nếu không cần

### 9. **modules/semesters/semesters.controller.js**
- **Vị trí**: `backend/src/modules/semesters/semesters.controller.js`
- **Tình trạng**: Chỉ được export trong `index.js`, nhưng routes mới sử dụng `presentation/SemestersController.js`
- **Lưu ý**: File này có thể được giữ lại để backward compatibility hoặc xóa nếu không cần

### 10. **modules/classes/classes.controller.js**
- **Vị trí**: `backend/src/modules/classes/classes.controller.js` (nếu tồn tại)
- **Tình trạng**: Không được import ở đâu cả
- **Lưu ý**: File này có thể đã bị xóa hoặc không tồn tại

---

## 📝 CÁC FILE LEGACY SERVICE/REPO (VẪN ĐƯỢC SỬ DỤNG MỘT PHẦN)

### 11. **modules/activities/activities.service.js**
- **Vị trí**: `backend/src/modules/activities/activities.service.js`
- **Tình trạng**: Vẫn được sử dụng trong `GetActivityQRDataUseCase.js` (dòng 33-34) để generate QR
- **Lưu ý**: ⚠️ Cần refactor để sử dụng repository pattern thay vì service legacy

### 12. **modules/users/users.service.js**
- **Vị trí**: `backend/src/modules/users/users.service.js`
- **Tình trạng**: Chỉ được sử dụng trong `users.controller.js` (legacy)
- **Lưu ý**: Có thể xóa nếu không cần backward compatibility

### 13. **modules/classes/classes.service.js**
- **Vị trí**: `backend/src/modules/classes/classes.service.js`
- **Tình trạng**: Được export trong `index.js` nhưng routes mới không sử dụng
- **Lưu ý**: Có thể xóa nếu không cần backward compatibility

### 14. **modules/semesters/semesters.service.js**
- **Vị trí**: `backend/src/modules/semesters/semesters.service.js`
- **Tình trạng**: Được sử dụng trong một số use cases và controller
- **Lưu ý**: ⚠️ Cần kiểm tra kỹ trước khi xóa

### 15. **modules/auth/auth.service.js**
- **Vị trí**: `backend/src/modules/auth/auth.service.js`
- **Tình trạng**: Được sử dụng trong một số use cases
- **Lưu ý**: ⚠️ Cần kiểm tra kỹ trước khi xóa

---

## 🔍 CÁC FILE ROUTES LEGACY (VẪN ĐƯỢC SỬ DỤNG)

### 16. **routes/activities.route.js**
- **Vị trí**: `backend/src/routes/activities.route.js`
- **Tình trạng**: ✅ Được sử dụng - chỉ là alias redirect đến routes mới
- **Lưu ý**: Giữ lại để backward compatibility

### 17. **routes/qr-attendance.route.js**
- **Vị trí**: `backend/src/routes/qr-attendance.route.js`
- **Tình trạng**: ⚠️ File không tồn tại nhưng được import trong `app/routes.js` với try-catch
- **Lưu ý**: Có thể xóa dòng import này

---

## ✅ KẾT LUẬN

### Các file có thể xóa ngay:
1. `routes/index.js`
2. `models/auth.model.js`
3. `models/user.model.js`
4. `app/errors/AppError.js`
5. `app/policies/index.js`

### Các file cần xem xét:
- Các file legacy controller trong modules (chỉ export trong index.js)
- Các file legacy service/repo (một số vẫn được sử dụng)

### Các file cần refactor:
- `GetActivityQRDataUseCase.js` - đang sử dụng `activities.service` thay vì repository pattern

---

## 📌 LƯU Ý

- **Trước khi xóa**: Nên chạy test để đảm bảo không ảnh hưởng đến chức năng
- **Backward compatibility**: Một số file legacy có thể được giữ lại để đảm bảo tương thích với code cũ
- **Dependency check**: Một số file có thể được import động (dynamic require) nên cần kiểm tra kỹ

