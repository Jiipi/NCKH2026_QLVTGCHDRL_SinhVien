# HƯỚNG DẪN DEMO DEVOPS CHO BÁO CÁO SEMINAR

## Tổng quan luồng Demo

```
[1] Chạy truyền thống (npm)
        ↓
[2] Chuyển sang Docker (container hóa)
        ↓
[3] Git Flow: tạo branch → code → commit → push
        ↓
[4] GitHub Actions tự động chạy CI/CD
        ↓
[5] Deploy: Frontend → Vercel | Backend → Render
```

---

## PHẦN 1: CHẠY ỨNG DỤNG TRUYỀN THỐNG (npm)

### Mục đích
Cho thấy cách chạy app thủ công, phải mở nhiều terminal, cài đặt phức tạp.

### Thao tác cần làm

**Bước 1.1: Cài đặt dependencies backend**
```bash
cd backend
npm install
```
> **Screenshot 1:** Chụp terminal đang chạy `npm install` trong thư mục backend (thấy các package đang được tải)

**Bước 1.2: Cài đặt dependencies frontend**
```bash
cd frontend
npm install
```
> **Screenshot 2:** Chụp terminal đang chạy `npm install` trong thư mục frontend

**Bước 1.3: Cấu hình database thủ công**
- Mở pgAdmin hoặc cài PostgreSQL local
- Tạo database `Web_QuanLyDiemRenLuyen`
- Chạy Prisma migrate:
```bash
cd backend
npx prisma db push
```
> **Screenshot 3:** Chụp pgAdmin hoặc terminal chạy prisma db push thành công

**Bước 1.4: Chạy Backend (Terminal 1)**
```bash
cd backend
npm run dev
```
> **Screenshot 4:** Chụp terminal backend đang chạy ở port 3001

**Bước 1.5: Chạy Frontend (Terminal 2 - mở riêng)**
```bash
cd frontend
npm start
```
> **Screenshot 5:** Chụp terminal frontend đang chạy ở port 3000

**Bước 1.6: Mở trình duyệt**
- Truy cập `http://localhost:3000`
> **Screenshot 6:** Chụp giao diện web đang chạy trên trình duyệt

### Nhận xét cho báo cáo
> "Cách chạy truyền thống yêu cầu:
> - Cài đặt Node.js, PostgreSQL trên máy
> - Mở ít nhất 2 terminal riêng biệt
> - Cấu hình database thủ công
> - Mỗi thành viên mới phải lặp lại toàn bộ quy trình"

---

## PHẦN 2: CHUYỂN SANG DOCKER (Container hóa - DevOps)

### Mục đích
Cho thấy chỉ cần 1 lệnh Docker để chạy toàn bộ hệ thống.

### Thao tác cần làm

**Bước 2.1: Hiển thị file docker-compose.yml**
- Mở file `docker-compose.yml` trên VSCode
> **Screenshot 7:** Chụp VSCode hiển thị nội dung docker-compose.yml, highlight các services: `db`, `backend-dev`, `frontend-dev`

**Bước 2.2: Hiển thị Dockerfile**
- Mở file `backend/Dockerfile` trên VSCode
> **Screenshot 8:** Chụp VSCode hiển thị Dockerfile với multi-stage build (base → backend_deps → frontend_build → runtime)

**Bước 2.3: Chạy toàn bộ hệ thống bằng 1 lệnh**
```bash
# Development mode - khởi động tất cả services
docker compose --profile dev up -d
```
> **Screenshot 9:** Chụp terminal đang build và khởi động containers

**Bước 2.4: Xem containers đang chạy**
```bash
docker compose ps
```
> **Screenshot 10:** Chụp terminal hiển thị danh sách containers (db, backend-dev, frontend-dev, prisma-studio) đều ở trạng thái "Up/Healthy"

**Bước 2.5: Mở Docker Desktop**
> **Screenshot 11:** Chụp Docker Desktop hiển thị tất cả containers đang chạy (dacn_db, dacn_backend_dev, dacn_frontend_dev, dacn_prisma_studio)

**Bước 2.6: Xem logs realtime qua Dozzle**
- Truy cập `http://localhost:9999` (Dozzle - log viewer)
> **Screenshot 12:** Chụp giao diện Dozzle hiển thị logs realtime của các containers

**Bước 2.7: Truy cập các services**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api/health`
- Prisma Studio: `http://localhost:5555`
> **Screenshot 13:** Chụp 3 tab trình duyệt mở đồng thời: frontend, API health, Prisma Studio

### Nhận xét cho báo cáo
> "Với Docker, toàn bộ hệ thống (Database, Backend, Frontend, công cụ quản lý DB) được khởi động chỉ bằng 1 lệnh duy nhất. Thành viên mới chỉ cần cài Docker và chạy `docker compose --profile dev up -d` là có thể bắt đầu làm việc ngay."

### So sánh cho slide
| Tiêu chí | Truyền thống (npm) | DevOps (Docker) |
|---|---|---|
| Số lệnh cần chạy | 5-6 lệnh | 1 lệnh duy nhất |
| Cài đặt yêu cầu | Node, PostgreSQL, pgAdmin | Chỉ cần Docker |
| Số terminal | 2-3 terminal | 1 terminal |
| Môi trường đồng nhất | Không (mỗi máy khác nhau) | Có (container giống nhau) |
| Thời gian setup cho người mới | 30-60 phút | 5 phút |

---

## PHẦN 3: GIT FLOW - Quản lý mã nguồn

### Mục đích
Demo quy trình làm việc với Git: tạo branch, code, commit, push → tự động trigger CI/CD.

### Thao tác cần làm

**Bước 3.1: Xem trạng thái hiện tại**
```bash
git status
git log --oneline -5
```
> **Screenshot 14:** Chụp terminal hiển thị git status và lịch sử commit gần nhất

**Bước 3.2: Tạo branch mới (theo Git Flow)**
```bash
git checkout -b feature/demo-devops
```
> **Screenshot 15:** Chụp terminal tạo branch mới thành công

**Bước 3.3: Thực hiện thay đổi nhỏ (ví dụ: thêm log version)**
- Mở file `backend/src/app/server.ts`, thêm 1 dòng log
- Hoặc sửa 1 dòng text nhỏ ở frontend
> **Screenshot 16:** Chụp VSCode hiển thị thay đổi code (Source Control tab hiển thị diff)

**Bước 3.4: Stage và Commit**
```bash
git add .
git commit -m "feat: add version logging for demo DevOps pipeline"
```
> **Screenshot 17:** Chụp terminal commit thành công

**Bước 3.5: Push lên GitHub**
```bash
git push origin feature/demo-devops
```
> **Screenshot 18:** Chụp terminal push thành công lên remote

**Bước 3.6: Tạo Pull Request trên GitHub**
- Mở GitHub repo → Pull Requests → New Pull Request
- Base: `main` ← Compare: `feature/demo-devops`
> **Screenshot 19:** Chụp trang tạo Pull Request trên GitHub, thấy diff thay đổi

### Nhận xét cho báo cáo
> "Git Flow giúp quản lý mã nguồn có tổ chức: mỗi tính năng được phát triển trên branch riêng, review qua Pull Request, và chỉ merge vào main khi đã qua kiểm tra tự động."

---

## PHẦN 4: GITHUB ACTIONS - CI/CD Pipeline tự động

### Mục đích
Cho thấy khi push code, GitHub Actions tự động chạy: test → build Docker → scan bảo mật.

### Thao tác cần làm

**Bước 4.1: Hiển thị file CI/CD workflow**
- Mở file `.github/workflows/ci-cd.yml` trên VSCode
> **Screenshot 20:** Chụp VSCode hiển thị file ci-cd.yml, highlight cấu trúc 4 jobs: test, build, security, notify

**Bước 4.2: Push code để trigger pipeline**
- Sau khi push ở Bước 3.5, vào GitHub repo → tab "Actions"
> **Screenshot 21:** Chụp tab Actions trên GitHub, thấy workflow "CI/CD Pipeline" đang chạy (icon vòng tròn vàng quay)

**Bước 4.3: Xem Job 1 - Test & Lint**
- Click vào workflow run → xem job "Test & Lint"
> **Screenshot 22:** Chụp chi tiết Job "Test & Lint" đang chạy/thành công, thấy các bước:
> - Checkout code
> - Setup Node.js
> - Install dependencies
> - Setup database schema
> - Run backend tests
> - Run frontend tests

**Bước 4.4: Xem Job 2 - Build Docker Images**
> **Screenshot 23:** Chụp job "Build Docker Images" thành công, thấy:
> - Docker Buildx setup
> - Build and push backend image
> - Build and push frontend image

**Bước 4.5: Xem Job 3 - Security Scan**
> **Screenshot 24:** Chụp job "Security Scan" với Trivy vulnerability scanner

**Bước 4.6: Xem tổng quan pipeline hoàn thành**
> **Screenshot 25:** Chụp tổng quan workflow với tất cả 4 jobs đều tick xanh (✓ test → ✓ build → ✓ security → ✓ notify)

**Bước 4.7: Hiển thị file Deploy workflow**
- Mở file `.github/workflows/deploy.yml`
> **Screenshot 26:** Chụp VSCode hiển thị deploy.yml, thấy 2 jobs: deploy-frontend (Vercel), deploy-backend (Railway/Render)

### Sơ đồ pipeline cho slide
```
Push Code → [GitHub Actions Trigger]
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   [Test & Lint] [Build Docker] [Security Scan]
        │           │           │
        └───────────┼───────────┘
                    ▼
              [Notify Results]
                    │
              (Nếu main branch)
                    ▼
         [Deploy to Production]
         ┌──────────┴──────────┐
         ▼                     ▼
   [Frontend → Vercel]  [Backend → Render]
```

### Nhận xét cho báo cáo
> "Pipeline CI/CD tự động hóa toàn bộ quy trình kiểm tra và triển khai:
> - Mỗi lần push code, hệ thống tự động chạy test
> - Tự động build Docker images
> - Tự động quét lỗ hổng bảo mật (Trivy)
> - Nếu tất cả pass → tự động deploy lên production"

---

## PHẦN 5: DEPLOY FRONTEND LÊN VERCEL

### Mục đích
Demo quá trình deploy frontend (React) lên Vercel - hosting miễn phí cho frontend.

### Thao tác cần làm

**Bước 5.1: Hiển thị cấu hình Vercel**
- Mở file `vercel.json`
> **Screenshot 27:** Chụp VSCode hiển thị vercel.json với cấu hình:
> - Build command: `cd frontend && npm ci && npm run build`
> - Framework: create-react-app
> - Region: sin1 (Singapore)

**Bước 5.2: Mở Vercel Dashboard**
- Đăng nhập Vercel → vào project
> **Screenshot 28:** Chụp Vercel Dashboard hiển thị project đã kết nối với GitHub repo

**Bước 5.3: Xem lịch sử deployments**
> **Screenshot 29:** Chụp trang Deployments trên Vercel, thấy danh sách các lần deploy (mỗi lần push main → tự động deploy)

**Bước 5.4: Xem chi tiết 1 deployment**
- Click vào 1 deployment gần nhất
> **Screenshot 30:** Chụp chi tiết deployment: thấy build logs, thời gian build, status "Ready"

**Bước 5.5: Truy cập website đã deploy**
- Mở URL production của Vercel (ví dụ: `https://qlvtgchdrl-sinhvien.vercel.app`)
> **Screenshot 31:** Chụp trình duyệt hiển thị website đã deploy thành công trên Vercel, thanh URL hiển thị domain Vercel

**Bước 5.6: (Tùy chọn) Xem Preview deployment cho Pull Request**
- Khi tạo PR, Vercel tự động tạo preview URL
> **Screenshot 32:** Chụp comment bot Vercel trên Pull Request, hiển thị preview URL

### Nhận xét cho báo cáo
> "Vercel tự động deploy frontend mỗi khi code được push lên branch main. Mỗi Pull Request cũng được tạo preview URL riêng để review trước khi merge."

---

## PHẦN 6: DEPLOY BACKEND LÊN RENDER

### Mục đích
Demo quá trình deploy backend (Node.js + PostgreSQL) lên Render.

### Thao tác cần làm

**Bước 6.1: Hiển thị cấu hình Render**
- Mở file `render.yaml`
> **Screenshot 33:** Chụp VSCode hiển thị render.yaml với:
> - Web service: nckh2026-backend (Node.js)
> - Database: nckh2026-db (PostgreSQL)
> - Region: Singapore
> - Auto deploy: true

**Bước 6.2: Mở Render Dashboard**
- Đăng nhập Render → vào Dashboard
> **Screenshot 34:** Chụp Render Dashboard hiển thị 2 services: Web Service (backend) và Database (PostgreSQL)

**Bước 6.3: Xem Web Service detail**
- Click vào backend service
> **Screenshot 35:** Chụp trang chi tiết Web Service: thấy status "Live", deployment history, environment variables

**Bước 6.4: Xem Build & Deploy logs**
> **Screenshot 36:** Chụp build logs trên Render, thấy quá trình:
> - `npm ci` (cài dependencies)
> - `npm run build` (build TypeScript)
> - `npx prisma generate` (generate Prisma client)
> - `npx prisma migrate deploy` (chạy migration)
> - `node dist/index.js` (start server)

**Bước 6.5: Xem Database service**
> **Screenshot 37:** Chụp trang PostgreSQL database trên Render: thấy connection info, status

**Bước 6.6: Test API endpoint production**
- Truy cập API health check: `https://<your-render-url>/api/health`
> **Screenshot 38:** Chụp trình duyệt hiển thị response JSON từ API health endpoint (status: "ok")

**Bước 6.7: Xem Auto Deploy**
- Push 1 commit lên main → Render tự động rebuild
> **Screenshot 39:** Chụp Render đang "In progress" build sau khi push code mới

### Nhận xét cho báo cáo
> "Render cung cấp hosting backend với PostgreSQL tích hợp. Kết hợp với `render.yaml` (Infrastructure as Code), toàn bộ cấu hình server được quản lý bằng code, đảm bảo tính nhất quán và tái tạo được."

---

## TỔNG KẾT - Danh sách Screenshot cần chụp

| # | Nội dung | Phần |
|---|----------|------|
| 1 | Terminal `npm install` backend | Phần 1 |
| 2 | Terminal `npm install` frontend | Phần 1 |
| 3 | Prisma db push / pgAdmin | Phần 1 |
| 4 | Terminal backend đang chạy (port 3001) | Phần 1 |
| 5 | Terminal frontend đang chạy (port 3000) | Phần 1 |
| 6 | Trình duyệt web localhost:3000 | Phần 1 |
| 7 | VSCode: docker-compose.yml | Phần 2 |
| 8 | VSCode: Dockerfile (multi-stage) | Phần 2 |
| 9 | Terminal: docker compose up | Phần 2 |
| 10 | Terminal: docker compose ps (healthy) | Phần 2 |
| 11 | Docker Desktop: containers list | Phần 2 |
| 12 | Dozzle: realtime logs | Phần 2 |
| 13 | Trình duyệt: frontend + API + Prisma Studio | Phần 2 |
| 14 | Terminal: git status + git log | Phần 3 |
| 15 | Terminal: git checkout -b feature branch | Phần 3 |
| 16 | VSCode: Source Control diff | Phần 3 |
| 17 | Terminal: git commit | Phần 3 |
| 18 | Terminal: git push | Phần 3 |
| 19 | GitHub: Pull Request page | Phần 3 |
| 20 | VSCode: ci-cd.yml workflow file | Phần 4 |
| 21 | GitHub Actions: pipeline đang chạy | Phần 4 |
| 22 | GitHub Actions: Job Test & Lint detail | Phần 4 |
| 23 | GitHub Actions: Job Build Docker | Phần 4 |
| 24 | GitHub Actions: Job Security Scan | Phần 4 |
| 25 | GitHub Actions: tổng quan 4 jobs xanh | Phần 4 |
| 26 | VSCode: deploy.yml file | Phần 4 |
| 27 | VSCode: vercel.json | Phần 5 |
| 28 | Vercel Dashboard: project overview | Phần 5 |
| 29 | Vercel: deployments history | Phần 5 |
| 30 | Vercel: build logs detail | Phần 5 |
| 31 | Trình duyệt: website trên Vercel | Phần 5 |
| 32 | GitHub PR: Vercel preview comment | Phần 5 |
| 33 | VSCode: render.yaml | Phần 6 |
| 34 | Render Dashboard: services list | Phần 6 |
| 35 | Render: backend service detail | Phần 6 |
| 36 | Render: build/deploy logs | Phần 6 |
| 37 | Render: PostgreSQL database | Phần 6 |
| 38 | Trình duyệt: API health check | Phần 6 |
| 39 | Render: auto deploy in progress | Phần 6 |

---

## MẪU VĂN BẢN CHO BÁO CÁO

### Mở đầu phần Demo
> Để minh họa việc áp dụng DevOps vào dự án "Quản lý hoạt động điểm rèn luyện sinh viên", nhóm sẽ trình bày quá trình chuyển đổi từ phương pháp phát triển truyền thống sang quy trình DevOps hoàn chỉnh, bao gồm: container hóa bằng Docker, quản lý mã nguồn bằng Git Flow, tự động hóa CI/CD bằng GitHub Actions, và triển khai lên môi trường production bằng Vercel (Frontend) và Render (Backend).

### Kết luận phần Demo
> Qua demo, nhóm đã chứng minh được việc áp dụng DevOps giúp:
> 1. **Đơn giản hóa môi trường phát triển**: Từ 5-6 bước setup thủ công xuống còn 1 lệnh Docker
> 2. **Tự động hóa kiểm tra chất lượng**: Mỗi lần push code, pipeline tự động chạy test, lint, và quét bảo mật
> 3. **Triển khai liên tục (CD)**: Code merge vào main → tự động deploy lên Vercel và Render
> 4. **Minh bạch hóa tiến độ**: Mọi thay đổi đều được track qua Git, review qua Pull Request, và giám sát qua GitHub Actions

---

## THỨ TỰ THỰC HIỆN DEMO (Gợi ý)

1. **Bắt đầu**: Mở project trên VSCode, giới thiệu cấu trúc dự án
2. **Demo npm**: Chạy nhanh backend + frontend bằng npm (đã chuẩn bị sẵn)
3. **Demo Docker**: Tắt npm, chạy `docker compose --profile dev up -d`, mở Docker Desktop
4. **Demo Git Flow**: Tạo branch, sửa code nhỏ, commit, push
5. **Demo Actions**: Chuyển sang GitHub, xem pipeline chạy
6. **Demo Vercel**: Mở Vercel dashboard, xem deployment, truy cập website
7. **Demo Render**: Mở Render dashboard, xem backend service, test API
8. **Kết luận**: So sánh truyền thống vs DevOps, liên hệ lý thuyết CALMS
