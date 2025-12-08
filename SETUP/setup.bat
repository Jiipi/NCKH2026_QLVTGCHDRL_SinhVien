@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔══════════════════════════════════════════════════════════════╗
echo ║     SETUP DU AN QUAN LY DIEM REN LUYEN - DACN                ║
echo ║     Tu dong cai dat va chay du an tren localhost             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM ================================================================
REM KIEM TRA YEU CAU HE THONG
REM ================================================================
echo [1/6] Kiem tra yeu cau he thong...
echo.

REM Kiem tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [LOI] Node.js chua duoc cai dat!
    echo       Tai ve tai: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   [OK] Node.js: %NODE_VERSION%

REM Kiem tra npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [LOI] npm chua duoc cai dat!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo   [OK] npm: v%NPM_VERSION%

REM Kiem tra Docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [LOI] Docker chua duoc cai dat!
    echo       Tai ve tai: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo   [OK] Docker da cai dat

REM Kiem tra Docker daemon
docker info >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [LOI] Docker Desktop chua chay!
    echo       Vui long mo Docker Desktop va cho no khoi dong xong.
    echo.
    pause
    exit /b 1
)
echo   [OK] Docker dang chay

echo.

REM ================================================================
REM CAI DAT NODE_MODULES (Optional - Docker se tu cai)
REM ================================================================
echo [2/6] Cai dat dependencies (optional cho IDE support)...
echo.

set INSTALL_LOCAL=n
set /p INSTALL_LOCAL="Ban co muon cai node_modules local cho IDE [y/N]: "
if /i "%INSTALL_LOCAL%"=="y" (
    echo.
    echo   Dang cai dat root dependencies...
    call npm install --silent
    
    echo   Dang cai dat backend dependencies...
    cd backend
    call npm install --silent
    cd ..
    
    echo   Dang cai dat frontend dependencies...
    cd frontend
    call npm install --silent
    cd ..
    
    echo   [OK] Da cai dat tat ca node_modules
) else (
    echo   [SKIP] Bo qua cai dat local node_modules
    echo          Docker se tu dong cai dat trong container
)

echo.

REM ================================================================
REM TAO THU MUC CAN THIET
REM ================================================================
echo [3/6] Tao cac thu muc can thiet...
echo.

if not exist "backend\logs" mkdir "backend\logs"
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\backups" mkdir "backend\backups"
if not exist "backend\data" mkdir "backend\data"

echo   [OK] Da tao cac thu muc: logs, uploads, backups, data

echo.

REM ================================================================
REM DUNG CONTAINER CU (NEU CO)
REM ================================================================
echo [4/6] Dung cac container cu (neu co)...
echo.

docker-compose --profile dev down 2>nul
docker-compose down 2>nul

echo   [OK] Da dung cac container cu

echo.

REM ================================================================
REM KHOI DONG DOCKER CONTAINERS
REM ================================================================
echo [5/6] Khoi dong Docker containers...
echo.
echo   Dang khoi dong: db, prisma-studio, backend-dev, frontend-dev, dozzle
echo   (Lan dau co the mat 2-5 phut de tai images va cai dat)
echo.

docker-compose --profile dev up -d

if %ERRORLEVEL% neq 0 (
    echo [LOI] Khong the khoi dong Docker containers!
    pause
    exit /b 1
)

echo.
echo   [OK] Da khoi dong tat ca containers

echo.

REM ================================================================
REM DOI SERVICES KHOI DONG
REM ================================================================
echo [6/7] Doi cac services khoi dong...
echo.
echo   Dang cho database va backend san sang...
echo   (Co the mat 30-60 giay)
echo.

REM Doi 15 giay cho DB khoi dong
timeout /t 15 /nobreak >nul

REM Hien thi trang thai containers
docker-compose --profile dev ps

echo.

REM ================================================================
REM KHOI TAO DU LIEU MAU (SEEDING)
REM ================================================================
echo [7/7] Khoi tao du lieu mau...
echo.

echo   Ban co the chay SEED DATA de tao du lieu mau moi (sach se).
echo   Du lieu bao gom:
echo     - Admin (admin/123456)
echo     - 100 Giang vien (theo 4 khoa)
echo     - 40 Lop hoc va 2000 Sinh vien
echo     - 200+ Hoat dong, dang ky va diem danh
echo.

set RUN_SEED=n
set /p RUN_SEED="Ban co muon khoi tao du lieu mau nay khong [y/N]: "
if /i "!RUN_SEED!"=="y" (
    echo.
    echo   Dang chay seed data (MAT KHOANG 30-60 GIAY)...
    echo   Vui long doi...
    
    docker exec dacn_backend_dev node scripts/seed_large.js
    
    if !ERRORLEVEL! equ 0 (
        echo.
        echo   [OK] Da tao du lieu mau thanh cong!
    ) else (
        echo.
        echo   [LOI] Khong the chay seed data. Hay kiem tra container backend-dev.
    )
) else (
    echo.
    echo   [SKIP] Bo qua khoi tao du lieu.
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    SETUP HOAN TAT!                           ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  TRUY CAP CAC DICH VU:                                       ║
echo ║                                                              ║
echo ║  Frontend:      http://localhost:3000                        ║
echo ║  Backend API:   http://localhost:3001                        ║
echo ║  Prisma Studio: http://localhost:5555                        ║
echo ║  Dozzle Logs:   http://localhost:9999                        ║
echo ║                                                              ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  TAI KHOAN MAC DINH:                                         ║
echo ║                                                              ║
echo ║  Admin:      Admin / 123456                      ║
echo ║  Giang vien: gv0404 / 123456                      ║
echo ║  Sinh vien:  2140402 / 123456   
echo ║  Lớp trưởng: 2140401 / 123456                                                          ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  LENH HUU ICH:                                               ║
echo ║                                                              ║
echo ║  Xem logs:        docker-compose --profile dev logs -f       ║
echo ║  Dung containers: docker-compose --profile dev down          ║
echo ║  Khoi dong lai:   docker-compose --profile dev up -d         ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

pause
