# Script tổng hợp test Admin Dashboard
# Kiểm tra: Dữ liệu Prisma -> Backend API -> Frontend Display

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "🔍 KIỂM TRA TOÀN BỘ ADMIN DASHBOARD" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra dữ liệu trong Prisma
Write-Host "📊 BƯỚC 1: Kiểm tra dữ liệu trong Prisma Studio" -ForegroundColor Yellow
Write-Host "-" * 80
node backend/scripts/check_admin_dashboard_data.js
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Lỗi kiểm tra dữ liệu Prisma!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Hỏi user có muốn seed dữ liệu không
Write-Host "💡 Bạn có muốn tạo thêm dữ liệu mẫu không? (Y/N)" -ForegroundColor Yellow
$seedChoice = Read-Host
if ($seedChoice -eq 'Y' -or $seedChoice -eq 'y') {
    Write-Host ""
    Write-Host "🌱 BƯỚC 2: Tạo dữ liệu mẫu..." -ForegroundColor Yellow
    Write-Host "-" * 80
    node backend/scripts/seed_admin_dashboard_data.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Lỗi tạo dữ liệu mẫu!" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# 3. Kiểm tra backend có đang chạy không
Write-Host "🔧 BƯỚC 3: Kiểm tra backend..." -ForegroundColor Yellow
Write-Host "-" * 80
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "✅ Backend đang chạy tại http://localhost:5000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend không chạy!" -ForegroundColor Red
    Write-Host "💡 Khởi động backend bằng lệnh: npm run dev (trong thư mục backend)" -ForegroundColor Yellow
    Write-Host "   hoặc: docker-compose up" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Bạn có muốn tiếp tục kiểm tra? (Y/N)" -ForegroundColor Yellow
    $continueChoice = Read-Host
    if ($continueChoice -ne 'Y' -and $continueChoice -ne 'y') {
        exit 0
    }
}
Write-Host ""

# 4. Test endpoints (nếu backend chạy)
if ($backendRunning) {
    Write-Host "🧪 BƯỚC 4: Test API endpoints..." -ForegroundColor Yellow
    Write-Host "-" * 80
    node backend/scripts/test_admin_endpoints.js
    Write-Host ""
}

# 5. Kiểm tra frontend build
Write-Host "🎨 BƯỚC 5: Kiểm tra frontend build..." -ForegroundColor Yellow
Write-Host "-" * 80
if (Test-Path "frontend\build\index.html") {
    $buildTime = (Get-Item "frontend\build\index.html").LastWriteTime
    Write-Host "✅ Frontend build tồn tại (Build lúc: $buildTime)" -ForegroundColor Green
    
    # Check if build is recent (within last 5 minutes)
    $timeDiff = (Get-Date) - $buildTime
    if ($timeDiff.TotalMinutes -gt 5) {
        Write-Host "⚠️  Build đã cũ (${([math]::Round($timeDiff.TotalMinutes, 1))} phút trước)" -ForegroundColor Yellow
        Write-Host "💡 Rebuild frontend: cd frontend; npm run build" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Build mới (${([math]::Round($timeDiff.TotalMinutes, 1))} phút trước)" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Frontend chưa build!" -ForegroundColor Red
    Write-Host "💡 Build frontend: cd frontend; npm run build" -ForegroundColor Yellow
}
Write-Host ""

# 6. Tổng kết
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "✅ HOÀN TẤT KIỂM TRA!" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 CÁC TAB ADMIN DASHBOARD:" -ForegroundColor White
Write-Host ""
Write-Host "   1️⃣  HOẠT ĐỘNG GẦN ĐÂY (Recent Activities)" -ForegroundColor White
Write-Host "       - Hiển thị 10 đăng ký mới nhất (tất cả trạng thái)" -ForegroundColor Gray
Write-Host "       - Badges màu: Xanh (đã duyệt/tham gia), Vàng (chờ), Đỏ (từ chối)" -ForegroundColor Gray
Write-Host ""
Write-Host "   2️⃣  DANH SÁCH HỌC KỲ (Semesters)" -ForegroundColor White
Write-Host "       - Hiển thị tất cả học kỳ trong hệ thống" -ForegroundColor Gray
Write-Host "       - Status: Đang diễn ra / Đã khóa / Đã kết thúc" -ForegroundColor Gray
Write-Host ""
Write-Host "   3️⃣  PHÊ DUYỆT ĐĂNG KÝ (Approvals)" -ForegroundColor White
Write-Host "       - Hiển thị đăng ký trạng thái 'chờ duyệt' (cho_duyet)" -ForegroundColor Gray
Write-Host "       - Nút Duyệt (xanh) và Từ chối (đỏ)" -ForegroundColor Gray
Write-Host ""
Write-Host "📂 SIDEBARS:" -ForegroundColor White
Write-Host "   - Danh sách lớp: Tên lớp + số lượng sinh viên" -ForegroundColor Gray
Write-Host "   - Danh sách giảng viên: 10 giảng viên đầu tiên (role: GIANG_VIEN)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 TIẾP THEO:" -ForegroundColor Yellow
if (-not $backendRunning) {
    Write-Host "   1. Khởi động backend: cd backend; npm run dev" -ForegroundColor White
}
Write-Host "   1. Mở trình duyệt: http://localhost:3000/admin" -ForegroundColor White
Write-Host "   2. Đăng nhập với tài khoản admin" -ForegroundColor White
Write-Host "   3. Kiểm tra 3 tab và 2 sidebar có hiển thị dữ liệu" -ForegroundColor White
Write-Host "   4. Mở Console (F12) xem logs để debug nếu cần" -ForegroundColor White
Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
