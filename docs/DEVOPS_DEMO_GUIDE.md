# 🚀 HƯỚNG DẪN DEMO DEVOPS CHI TIẾT

## 📋 Tổng Quan

Hướng dẫn này giúp bạn thực hiện demo DevOps hoàn chỉnh trong 10-15 phút cho dự án **Quản lý Hoạt động Rèn Luyện Sinh Viên**.

---

## ✅ CHECKLIST TRƯỚC KHI DEMO

### Yêu cầu hệ thống
- [ ] Git đã cài đặt
- [ ] Docker Desktop đã cài đặt và đang chạy
- [ ] Tài khoản GitHub (đã có repo: `Jiipi/NCKH2026_QLVTGCHDRL_SinhVien`)
- [ ] Visual Studio Code (khuyến nghị)

### Kiểm tra nhanh
```powershell
# Kiểm tra Git
git --version

# Kiểm tra Docker
docker --version
docker-compose --version

# Clone repo (nếu chưa có)
git clone https://github.com/Jiipi/NCKH2026_QLVTGCHDRL_SinhVien.git
```

---

## 📅 KẾ HOẠCH DEMO (10-15 phút)

| Bước | Nội dung | Thời gian |
|------|----------|-----------|
| 1 | Giới thiệu sơ đồ pipeline | 1 phút |
| 2 | Setup secrets (nếu chưa có) | 1 phút |
| 3 | Demo local với Docker | 2 phút |
| 4 | Push code & trigger CI | 2 phút |
| 5 | Xem pipeline chạy | 3 phút |
| 6 | Demo case FAIL → FIX → PASS | 4 phút |
| 7 | Show kết quả & kết luận | 2 phút |

---

## 🎯 BƯỚC 1: GIỚI THIỆU SƠ ĐỒ PIPELINE (Slide)

### Sơ đồ CI/CD Pipeline

```
┌─────────────┐
│   COMMIT    │
│  (Developer)│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS                            │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │  JOB 1: TEST  │  │  JOB 3:       │  │                 │  │
│  │  • npm ci     │  │  SECURITY     │  │                 │  │
│  │  • npm lint   │  │  • Trivy Scan │  │                 │  │
│  │  • npm test   │  │  • SARIF      │  │                 │  │
│  └───────┬───────┘  └───────────────┘  │                 │  │
│          │                              │                 │  │
│          ▼                              │                 │  │
│  ┌───────────────┐                      │                 │  │
│  │  JOB 2: BUILD │                      │                 │  │
│  │  • Docker     │──────────────────────┘                 │  │
│  │  • Push ghcr  │                                        │  │
│  └───────┬───────┘                                        │  │
│          │                                                 │  │
│          ▼                                                 │  │
│  ┌───────────────┐                                        │  │
│  │ JOB 4: NOTIFY │                                        │  │
│  │ • Status log  │                                        │  │
│  └───────────────┘                                        │  │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│           CONTAINER REGISTRY            │
│  ghcr.io/jiipi/...-backend:latest       │
│  ghcr.io/jiipi/...-frontend:latest      │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         DEPLOY (Local/Staging)          │
│  docker pull → docker-compose up        │
└─────────────────────────────────────────┘
```

---

## 🔐 BƯỚC 2: SETUP GITHUB SECRETS

### 2.1 Truy cập Settings
1. Vào repo GitHub: `https://github.com/Jiipi/NCKH2026_QLVTGCHDRL_SinhVien`
2. Chọn **Settings** → **Secrets and variables** → **Actions**

### 2.2 Thêm Secrets (nếu cần)

| Secret Name | Mô tả | Bắt buộc |
|-------------|-------|----------|
| `GITHUB_TOKEN` | Tự động có | ✅ Có sẵn |
| `REACT_APP_API_URL` | API URL cho frontend | ❌ Optional |

> **Lưu ý**: `GITHUB_TOKEN` được GitHub tự động cung cấp, bạn không cần tạo.

### 2.3 Screenshot cho demo
- Mở tab **Secrets and variables** → **Actions**
- Chụp màn hình cho thấy secrets đã được cấu hình
- **KHÔNG show giá trị secret**

---

## 🐳 BƯỚC 3: DEMO LOCAL VỚI DOCKER

### 3.1 Chạy ứng dụng local (Development mode)

```powershell
# Di chuyển vào thư mục dự án
cd D:\DACN_Web_quanly_hoatdongrenluyen-master

# Chạy với Docker Compose (Dev mode)
docker-compose --profile dev up -d

# Kiểm tra các container đang chạy
docker ps

# Xem logs
docker-compose logs -f backend-dev
```

### 3.2 Kiểm tra health endpoint

```powershell
# Test backend health
curl http://localhost:3001/health

# Kết quả mong đợi:
# {"status":"ok"}

# Test API health
curl http://localhost:3001/api/health

# Kết quả mong đợi (ví dụ):
# {
#   "status": "ok",
#   "service": "dacn-backend",
#   "version": "dev",
#   "commit": "local",
#   "timestamp": "2026-01-19T...Z"
# }
```

### 3.2.1 Chạy test health mới (để show "CI chạy test")

```powershell
cd D:\DACN_Web_quanly_hoatdongrenluyen-master\backend
npm ci
npm test -- --runInBand --testPathPatterns=health.test.js
```

### 3.3 Mở ứng dụng trong browser
- Backend API: http://localhost:3001/api/health
- Frontend: http://localhost:3000 (nếu chạy frontend-dev)

### 3.4 Tắt containers (sau demo)
```powershell
docker-compose --profile dev down
```

---

## 🔄 BƯỚC 4: PUSH CODE & TRIGGER CI

### 4.1 Tạo thay đổi nhỏ để trigger pipeline

```powershell
# Tạo file demo
echo "# Demo DevOps - $(Get-Date -Format 'yyyy-MM-dd HH:mm')" > demo-trigger.md

# Stage và commit
git add demo-trigger.md
git commit -m "demo: trigger CI/CD pipeline"

# Push lên GitHub
git push origin main
```

### 4.2 Hoặc tạo thay đổi trong health endpoint

```powershell
# Mở file health.route.ts và thêm timestamp
code backend/src/presentation/routes/health.route.ts
```

Thêm dòng sau vào response:
```typescript
router.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),  // Thêm dòng này
    version: '1.0.0'  // Thêm dòng này
  });
});
```

Sau đó commit và push:
```powershell
git add .
git commit -m "feat: add timestamp to health endpoint"
git push origin main
```

---

## 👀 BƯỚC 5: XEM PIPELINE CHẠY

### 5.1 Mở GitHub Actions

1. Vào repo: `https://github.com/Jiipi/NCKH2026_QLVTGCHDRL_SinhVien`
2. Chọn tab **Actions**
3. Click vào workflow đang chạy

### 5.2 Các điểm cần chỉ ra trong demo

| Thành phần | Nơi xem | Ý nghĩa |
|------------|---------|---------|
| **Trigger** | Commit message | Cho thấy push kích hoạt pipeline |
| **Jobs** | Workflow graph | 4 jobs: test, build, security, notify |
| **Steps** | Click vào job | Chi tiết từng bước |
| **Logs** | Expand step | Output console |
| **Status** | Badge ✅/❌ | Pass/Fail |
| **Duration** | Góc phải | Thời gian chạy |

### 5.3 Screenshot cần chụp cho slide
1. Tổng quan workflow với các jobs
2. Chi tiết Job "Test & Lint"
3. Chi tiết Job "Build Docker Images"
4. Registry images (nếu push thành công)

---

## ❌ BƯỚC 6: DEMO CASE FAIL → FIX → PASS

### 6.1 Tạo lỗi cố ý

**Option A: Lỗi syntax TypeScript**
```powershell
# Mở file và tạo lỗi
code backend/src/presentation/routes/health.route.ts
```

Sửa thành (thiếu dấu ngoặc):
```typescript
router.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok'
    timestamp: new Date().toISOString()  // Thiếu dấu phẩy - LỖI!
  });
});
```

**Option B: Tạo file test fail**
```powershell
# Tạo test file với assertion fail
@"
// backend/tests/demo-fail.test.js
describe('Demo fail test', () => {
  it('should fail intentionally', () => {
    expect(1).toBe(2);  // Sẽ fail!
  });
});
"@ | Out-File -FilePath backend/tests/demo-fail.test.js -Encoding utf8
```

### 6.2 Push code lỗi

```powershell
git add .
git commit -m "demo: intentional fail for demo"
git push origin main
```

### 6.3 Xem pipeline FAIL

1. Mở **Actions** tab
2. Thấy workflow ❌ đỏ
3. Click vào xem log lỗi
4. **Chụp screenshot** cho slide

### 6.4 Sửa lỗi

**Nếu dùng Option A:**
```typescript
router.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',  // Thêm dấu phẩy
    timestamp: new Date().toISOString()
  });
});
```

**Nếu dùng Option B:**
```powershell
# Xóa file test fail
Remove-Item backend/tests/demo-fail.test.js
```

### 6.5 Push code đã sửa

```powershell
git add .
git commit -m "fix: resolve intentional error"
git push origin main
```

### 6.6 Xem pipeline PASS ✅

1. Mở **Actions** tab
2. Thấy workflow ✅ xanh
3. **Chụp screenshot** cho slide

---

## 📊 BƯỚC 7: KẾT QUẢ & KẾT LUẬN

### 7.1 Kiểm tra Docker Registry (ghcr.io)

1. Vào: `https://github.com/Jiipi?tab=packages`
2. Hoặc: `https://github.com/Jiipi/NCKH2026_QLVTGCHDRL_SinhVien/pkgs/container`
3. Xem các images đã được push

### 7.2 Pull và chạy image từ registry (optional)

```powershell
# Login vào GitHub Container Registry
echo $env:GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull image
docker pull ghcr.io/jiipi/nckh2026_qlvtgchdrl_sinhvien-backend:latest

# Chạy container
docker run -p 3001:3001 ghcr.io/jiipi/nckh2026_qlvtgchdrl_sinhvien-backend:latest
```

### 7.3 Slide kết luận

**Liên hệ quản trị dự án:**

| Khía cạnh | Giải thích |
|-----------|------------|
| **Phạm vi** | CI/CD tự động cho toàn bộ backend + frontend |
| **Rủi ro** | Secrets được quản lý an toàn, không hardcode |
| **Tiêu chí nghiệm thu** | Pipeline pass = code đủ điều kiện deploy |
| **Drift môi trường** | Docker đảm bảo consistency giữa dev/prod |

---

## 📁 CẤU TRÚC FILE CI/CD

```
.github/
└── workflows/
    └── ci-cd.yml          # Main pipeline configuration

backend/
├── Dockerfile             # Dev Dockerfile
├── Dockerfile.production  # Production multi-stage build
├── package.json          # Scripts: test, lint, build
└── src/
    └── presentation/
        └── routes/
            └── health.route.ts  # Health check endpoint

frontend/
├── Dockerfile.production  # Production build with nginx
├── package.json          # Scripts: test, build
└── nginx.conf            # Nginx configuration

docker-compose.yml         # Local development
docker-compose.prod.yml    # Production deployment
```

---

## 🎬 SCRIPT DEMO NHANH (Copy-Paste)

```powershell
# ===== SETUP =====
cd D:\DACN_Web_quanly_hoatdongrenluyen-master

# ===== DEMO LOCAL =====
docker-compose --profile dev up -d
Start-Sleep -Seconds 30
curl http://localhost:3001/health

# ===== TRIGGER CI =====
echo "# Demo $(Get-Date)" > demo-trigger.md
git add demo-trigger.md
git commit -m "demo: trigger CI/CD"
git push origin main

# Mở browser xem Actions
Start-Process "https://github.com/Jiipi/NCKH2026_QLVTGCHDRL_SinhVien/actions"

# ===== DEMO FAIL =====
@"
describe('Fail test', () => {
  it('fails', () => expect(1).toBe(2));
});
"@ | Out-File backend/tests/demo-fail.test.js -Encoding utf8

git add . ; git commit -m "demo: intentional fail" ; git push origin main

# Chờ xem fail, sau đó:
Remove-Item backend/tests/demo-fail.test.js
git add . ; git commit -m "fix: remove fail test" ; git push origin main

# ===== CLEANUP =====
docker-compose --profile dev down
Remove-Item demo-trigger.md -ErrorAction SilentlyContinue
git add . ; git commit -m "cleanup: remove demo files" ; git push origin main
```

---

## ❓ TROUBLESHOOTING

### Pipeline không chạy
- Kiểm tra branch có phải `main` hoặc `develop` không
- Xem file `.github/workflows/ci-cd.yml` có tồn tại không

### Build Docker fail
- Kiểm tra Dockerfile syntax
- Xem logs chi tiết trong Actions

### Push image fail
- Kiểm tra repo có đặt public không (cho ghcr.io)
- Xác nhận permissions trong workflow

### Test fail
- Chạy local trước: `cd backend && npm test`
- Kiểm tra dependencies: `npm ci`

---

## 📚 TÀI LIỆU THAM KHẢO

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

**Tạo bởi:** GitHub Copilot  
**Ngày tạo:** 2026-01-18  
**Dự án:** NCKH2026_QLVTGCHDRL_SinhVien
