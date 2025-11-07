# 🛡️ Hướng dẫn bảo vệ code - Tránh mất file

## ⚠️ VẤN ĐỀ: File bị xóa mà Git không biết

Khi file chưa được commit vào Git, nếu bị xóa thì **KHÔNG THỂ KHÔI PHỤC** từ Git.

## ✅ GIẢI PHÁP: Quy trình làm việc an toàn

### 1. **Commit thường xuyên**
```bash
# SAU MỖI THAY ĐỔI QUAN TRỌNG, hãy commit ngay:
git add .
git commit -m "feat: tạo DashboardStudentImproved với Neo-brutalism design"
git push origin main
```

### 2. **Sử dụng Git Stash để backup tạm thời**
```bash
# Trước khi thử nghiệm hoặc thay đổi lớn:
git stash push -m "Backup trước khi refactor dashboard"

# Xem danh sách stash:
git stash list

# Khôi phục khi cần:
git stash apply stash@{0}
```

### 3. **Tạo branch để thử nghiệm**
```bash
# Tạo branch mới để thử code mới:
git checkout -b feature/neo-brutalism-dashboard

# Làm việc thoải mái, nếu hỏng có thể quay về main:
git checkout main
```

### 4. **Sử dụng VS Code Local History**
- VS Code tự động lưu lịch sử thay đổi file
- Chuột phải vào file → "Local History" → xem các phiên bản cũ
- Đã bật trong `.vscode/settings.json`

### 5. **Backup định kỳ**
```bash
# Tạo backup thủ công:
git archive --format=zip --output=backup-$(date +%Y%m%d).zip HEAD

# Hoặc copy toàn bộ thư mục:
Copy-Item -Path "D:\DACN_Web_quanly_hoatdongrenluyen-master" -Destination "D:\Backups\DACN_$(Get-Date -Format 'yyyyMMdd')" -Recurse
```

## 🚨 CHECKLIST trước khi xóa file:

- [ ] File đã được `git add`?
- [ ] File đã được `git commit`?
- [ ] File đã được `git push` lên remote?
- [ ] Đã tạo backup hoặc stash?
- [ ] Chắc chắn 100% không cần file này nữa?

## 📋 Quy trình làm việc hàng ngày:

### Buổi sáng:
```bash
git pull origin main
git status
```

### Trong khi code:
```bash
# Mỗi 30-60 phút hoặc sau mỗi feature nhỏ:
git add .
git status
git commit -m "descriptive message"
```

### Cuối ngày:
```bash
git add .
git commit -m "End of day: [mô tả công việc]"
git push origin main
```

## 🔧 Công cụ hỗ trợ:

1. **Git Graph** (VS Code Extension) - Xem trực quan Git history
2. **GitLens** (VS Code Extension) - Xem ai sửa gì, khi nào
3. **Local History** (built-in VS Code) - Backup tự động local

## 💡 Tips:

- **KHÔNG BAO GIỜ** làm việc trực tiếp trên `main` nếu là thay đổi lớn
- Luôn tạo branch cho feature mới
- Commit message rõ ràng: `feat:`, `fix:`, `refactor:`, `docs:`
- Push lên remote ít nhất 1 lần/ngày

## 🆘 Khôi phục khi bị mất:

### Nếu file đã commit:
```bash
git log --all --full-history -- path/to/file.js
git show <commit-hash>:path/to/file.js > recovered-file.js
```

### Nếu file chưa commit:
- Kiểm tra VS Code Local History
- Kiểm tra backup thủ công
- Kiểm tra Recycle Bin (nếu xóa bằng Delete)
- **KHÔNG THỂ khôi phục từ Git!**

---

**LƯU Ý:** Git chỉ bảo vệ những gì bạn đã commit. Nếu chưa commit = chưa được bảo vệ!
