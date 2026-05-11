# Roadmap triển khai nâng cao cho hệ thống quản lý hoạt động rèn luyện

## Mục tiêu tài liệu

Tài liệu này mô tả 8 giai đoạn nâng cấp hệ thống quản lý hoạt động rèn luyện theo hướng thực tế, an toàn và có khả năng mở rộng. Các giai đoạn được sắp xếp từ các tính năng có giá trị cao, phù hợp với hệ thống hiện tại đến các module nghiên cứu nâng cao như AI và Blockchain.

Nguyên tắc triển khai:

- Giữ ổn định hệ thống hiện tại: đăng nhập, phân quyền, đăng ký hoạt động, điểm danh, báo cáo.
- Ưu tiên giải quyết các vấn đề thật: điểm danh hộ, gửi QR cho người khác, mất mạng, thiếu minh bạch dữ liệu.
- Không đưa công nghệ phức tạp vào core system nếu chưa thật sự cần thiết.
- Các module AI/Blockchain nên thiết kế theo hướng optional, có thể bật/tắt hoặc triển khai sau.

---

## Tổng quan 8 giai đoạn

| Giai đoạn | Tên | Mục tiêu chính | Mức ưu tiên |
|---|---|---|---|
| 1 | QR động | Chống chụp/gửi mã QR điểm danh | Rất cao |
| 2 | Geofencing + fallback thủ công | Xác thực vị trí và xử lý lỗi nhân văn | Rất cao |
| 3 | Offline-first attendance | Điểm danh ổn định khi mạng yếu/mất mạng | Cao |
| 4 | Dashboard nâng cao | Báo cáo trực quan cho Admin/Giảng viên/Lớp trưởng | Cao |
| 5 | ETL import/export nâng cao | Nhập/xuất dữ liệu thực tế từ Excel/CSV/hệ thống ngoài | Cao |
| 6 | Face Attendance bằng RetinaFace + ArcFace | Đã có MVP kỹ thuật; cần hoàn thiện bảo mật, liveness, fallback, audit | Cao |
| 7 | Audit log / Hash chain | Tăng minh bạch, chống sửa dữ liệu âm thầm | Cao |
| 8 | Blockchain / Smart Contract / IPFS | Module nghiên cứu hoặc mở rộng tương lai | Thấp-Trung bình |

---

# Giai đoạn 1 — QR động

## 1.1. Vấn đề cần giải quyết

Hệ thống điểm danh QR thông thường có rủi ro lớn:

- Sinh viên chụp màn hình QR rồi gửi cho bạn.
- Sinh viên ở xa vẫn có thể điểm danh nếu nhận được ảnh QR.
- Mã QR tĩnh có thể bị dùng lại nhiều lần.

## 1.2. Mục tiêu

Triển khai QR có thời hạn ngắn, tự động thay đổi sau mỗi 30 giây hoặc 60 giây.

## 1.3. Luồng nghiệp vụ đề xuất

1. Giảng viên hoặc lớp trưởng mở trang quản lý điểm danh QR.
2. Hệ thống tạo một phiên điểm danh cho hoạt động.
3. Backend sinh QR token có thời hạn.
4. Frontend hiển thị QR kèm đồng hồ đếm ngược.
5. Sinh viên quét QR trong thời gian hợp lệ.
6. Backend kiểm tra token:
   - đúng hoạt động;
   - đúng phiên điểm danh;
   - chưa hết hạn;
   - chưa bị thu hồi;
   - sinh viên đủ điều kiện điểm danh.
7. Nếu hợp lệ, ghi nhận điểm danh.
8. Nếu hết hạn, yêu cầu sinh viên quét lại QR mới.

## 1.4. Thiết kế kỹ thuật

### Backend

Cần có service sinh token QR:

```text
qrAttendanceTokenService
- generateToken(activityId, sessionId, expiresInSeconds)
- verifyToken(token)
- revokeToken(token/sessionId)
```

Token nên chứa:

```json
{
  "activityId": "ACT001",
  "sessionId": "SESSION001",
  "issuedAt": 1710000000,
  "expiresAt": 1710000030,
  "nonce": "random-string"
}
```

Token cần được ký bởi server để tránh client tự sửa dữ liệu.

### Frontend

Trang QR management cần có:

- QR image hoặc QR string;
- countdown;
- trạng thái phiên điểm danh;
- nút tạo lại QR;
- tự refresh QR khi gần hết hạn.

### Database đề xuất

```text
attendance_sessions
- id
- activity_id
- created_by
- starts_at
- ends_at
- status
- created_at
- updated_at
```

```text
attendance_qr_tokens
- id
- session_id
- token_hash
- issued_at
- expires_at
- revoked_at
```

Có thể không lưu toàn bộ token, chỉ lưu hash nếu cần audit.

## 1.5. API đề xuất

```text
POST /activities/:activityId/attendance/session
GET  /activities/:activityId/attendance/session/current
POST /activities/:activityId/attendance/qr
POST /activities/:activityId/attendance/scan
```

## 1.6. Rủi ro

- Nếu thời gian hết hạn quá ngắn, sinh viên quét chậm sẽ lỗi.
- Nếu quá dài, QR vẫn có thể bị gửi cho người khác.
- Cần đồng bộ thời gian server/client.

## 1.7. Tiêu chí hoàn thành

- QR tự thay đổi theo chu kỳ.
- Token hết hạn không thể dùng lại.
- Build frontend/backend pass.
- Sinh viên quét QR cũ nhận thông báo rõ ràng.
- Giảng viên thấy trạng thái phiên điểm danh.

---

# Giai đoạn 2 — Geofencing + fallback thủ công

## 2.1. Vấn đề cần giải quyết

QR động vẫn chưa đủ để chặn trường hợp sinh viên nhận QR gần như thời gian thực từ bạn bè. Cần thêm lớp xác thực vị trí.

## 2.2. Mục tiêu

Kiểm tra sinh viên có đang ở gần địa điểm tổ chức hoạt động/lớp học hay không khi điểm danh.

## 2.3. Luồng nghiệp vụ đề xuất

1. Khi tạo hoạt động, giảng viên/admin khai báo địa điểm.
2. Nếu địa điểm có tọa độ, hệ thống lưu latitude/longitude và bán kính hợp lệ.
3. Khi sinh viên quét QR, frontend xin quyền vị trí.
4. Sinh viên gửi vị trí cùng QR token.
5. Backend tính khoảng cách từ vị trí sinh viên đến địa điểm hoạt động.
6. Nếu trong bán kính, cho điểm danh.
7. Nếu ngoài bán kính hoặc không lấy được vị trí, cho phép tạo yêu cầu xác minh thủ công.
8. Giảng viên/lớp trưởng duyệt hoặc từ chối yêu cầu.

## 2.4. Thiết kế kỹ thuật

### Frontend

Sử dụng Browser Geolocation API:

```text
navigator.geolocation.getCurrentPosition(...)
```

Cần hiển thị rõ:

- vì sao cần quyền vị trí;
- vị trí chỉ dùng cho điểm danh;
- nếu từ chối quyền, có thể gửi yêu cầu xác minh.

### Backend

Cần hàm tính khoảng cách bằng Haversine formula.

Dữ liệu gửi khi scan:

```json
{
  "qrToken": "signed-token",
  "location": {
    "latitude": 10.123,
    "longitude": 106.456,
    "accuracy": 25
  }
}
```

### Database đề xuất

Bổ sung cho hoạt động:

```text
activities
- latitude
- longitude
- location_radius_meters
- require_location_check
```

Thêm bảng yêu cầu xác minh:

```text
attendance_verification_requests
- id
- activity_id
- student_id
- attendance_id
- reason
- evidence_url
- status
- reviewed_by
- reviewed_at
- created_at
```

## 2.5. Fallback thủ công

Các lý do fallback:

- GPS sai.
- Sinh viên không cấp quyền vị trí.
- Thiết bị không hỗ trợ định vị.
- Hoạt động trong nhà, GPS không chính xác.
- Mạng yếu khiến request thất bại.

Trạng thái đề xuất:

```text
pending_review
approved
rejected
cancelled
```

## 2.6. Rủi ro

- GPS trong nhà có thể sai số lớn.
- Có thể bị fake location nếu người dùng cố tình gian lận.
- Cần HTTPS để browser cho lấy vị trí.

## 2.7. Tiêu chí hoàn thành

- Hoạt động có thể bật/tắt yêu cầu vị trí.
- Sinh viên trong bán kính điểm danh thành công.
- Sinh viên ngoài bán kính bị chặn hoặc chuyển sang xác minh thủ công.
- Giảng viên duyệt/từ chối yêu cầu được.

---

# Giai đoạn 3 — Offline-first attendance

## 3.1. Vấn đề cần giải quyết

Trong thực tế, điểm danh có thể thất bại vì:

- mạng yếu;
- server phản hồi chậm;
- nhiều sinh viên quét cùng lúc;
- thiết bị mất kết nối tạm thời.

## 3.2. Mục tiêu

Cho phép lưu tạm yêu cầu điểm danh khi mất mạng và tự đồng bộ lại khi có kết nối.

## 3.3. Luồng nghiệp vụ đề xuất

1. Sinh viên quét QR.
2. Frontend lấy QR token, timestamp, vị trí nếu có.
3. Nếu gọi API thành công, hiển thị đã điểm danh.
4. Nếu mất mạng, lưu record vào local queue.
5. Khi browser online lại, hệ thống tự sync.
6. Backend kiểm tra record offline:
   - token tại thời điểm quét có hợp lệ không;
   - timestamp có nằm trong thời gian cho phép không;
   - sinh viên có quyền điểm danh không;
   - có trùng điểm danh không.
7. Frontend hiển thị kết quả đồng bộ.

## 3.4. Thiết kế kỹ thuật

### Frontend storage

Nên dùng IndexedDB thay vì LocalStorage nếu dữ liệu nhiều.

Record lưu tạm:

```json
{
  "id": "local-id",
  "activityId": "ACT001",
  "qrToken": "signed-token",
  "scannedAt": "2026-05-04T08:00:00.000Z",
  "location": {
    "latitude": 10.123,
    "longitude": 106.456,
    "accuracy": 20
  },
  "status": "pending_sync"
}
```

### Sync engine

Cần module:

```text
offlineAttendanceQueue
- add(record)
- listPending()
- markSynced(id)
- markFailed(id, reason)
- retryAll()
```

### Backend

Endpoint sync:

```text
POST /attendance/offline-sync
```

Payload:

```json
{
  "records": [
    {
      "activityId": "ACT001",
      "qrToken": "signed-token",
      "scannedAt": "...",
      "location": {}
    }
  ]
}
```

## 3.5. Quy tắc chống gian lận

Không được tin hoàn toàn vào dữ liệu local. Backend phải kiểm tra:

- token hợp lệ tại thời điểm `scannedAt`;
- thời gian sync không quá trễ, ví dụ tối đa 5-10 phút;
- mỗi sinh viên chỉ được điểm danh một lần cho một session;
- nếu nghi ngờ, chuyển sang `pending_review`.

## 3.6. Tiêu chí hoàn thành

- Mất mạng vẫn lưu được record chờ sync.
- Có mạng lại tự sync.
- UI hiển thị rõ trạng thái từng record.
- Backend không chấp nhận record offline quá hạn hoặc bị sửa bất thường.

---

# Giai đoạn 4 — Dashboard nâng cao

## 4.1. Vấn đề cần giải quyết

Hệ thống cần hỗ trợ người quản lý ra quyết định, không chỉ lưu dữ liệu.

Các bên cần dashboard:

- Admin: toàn hệ thống.
- Giảng viên: hoạt động/lớp mình phụ trách.
- Lớp trưởng: tình hình lớp.
- Sinh viên: tiến độ cá nhân.

## 4.2. Mục tiêu

Tạo dashboard trực quan, có bộ lọc và biểu đồ tương tác.

## 4.3. Dashboard Admin

Chỉ số đề xuất:

- tổng hoạt động theo học kỳ;
- tổng lượt đăng ký;
- tỷ lệ tham gia thực tế;
- hoạt động theo loại;
- top hoạt động có nhiều sinh viên tham gia;
- top lớp tham gia tích cực;
- sinh viên có nguy cơ thiếu điểm rèn luyện;
- tỷ lệ duyệt/từ chối đăng ký.

## 4.4. Dashboard Giảng viên

Chỉ số đề xuất:

- hoạt động do giảng viên phụ trách;
- số sinh viên đăng ký;
- số sinh viên điểm danh;
- tỷ lệ vắng;
- danh sách sinh viên cần theo dõi;
- báo cáo theo lớp/học kỳ.

## 4.5. Dashboard Lớp trưởng

Chỉ số đề xuất:

- tình hình tham gia của lớp;
- sinh viên chưa đủ điểm;
- hoạt động sắp diễn ra;
- yêu cầu xác minh điểm danh đang chờ xử lý;
- thống kê theo tháng/học kỳ.

## 4.6. Dashboard Sinh viên

Chỉ số đề xuất:

- tổng điểm rèn luyện hiện tại;
- số hoạt động đã tham gia;
- hoạt động đã đăng ký nhưng chưa diễn ra;
- chứng chỉ đã đạt;
- gợi ý hoạt động phù hợp để đủ điểm.

## 4.7. Công nghệ biểu đồ

Có thể chọn:

- Recharts: nhẹ, phù hợp React.
- ECharts: nhiều loại biểu đồ, mạnh.
- Plotly: tương tác tốt, phù hợp phân tích dữ liệu sâu.

Khuyến nghị: dùng Recharts/ECharts trước; Plotly chỉ dùng nếu cần dashboard phân tích phức tạp.

## 4.8. Tiêu chí hoàn thành

- Có dashboard theo từng role.
- Có filter học kỳ/lớp/loại hoạt động.
- Biểu đồ load từ API thật.
- Không tính toán nặng ở frontend nếu backend có thể aggregate.

---

# Giai đoạn 5 — ETL import/export nâng cao

## 5.1. Vấn đề cần giải quyết

Môi trường trường học thường có dữ liệu từ nhiều nguồn:

- Excel danh sách sinh viên;
- Excel danh sách lớp;
- Excel hoạt động ngoại khóa;
- dữ liệu điểm danh từ hệ thống khác;
- báo cáo cần export theo mẫu.

## 5.2. Mục tiêu

Xây dựng quy trình nhập/xuất dữ liệu có preview, validate và audit log.

## 5.3. Luồng import đề xuất

1. Người dùng upload file Excel/CSV.
2. Backend parse file.
3. Hệ thống preview dữ liệu.
4. Validate lỗi:
   - thiếu trường bắt buộc;
   - sai mã sinh viên;
   - trùng dữ liệu;
   - sai định dạng ngày;
   - lớp không tồn tại;
   - hoạt động không tồn tại.
5. Người dùng xác nhận import.
6. Backend ghi dữ liệu chính thức.
7. Hệ thống ghi audit log.
8. Trả về kết quả import.

## 5.4. Loại import nên hỗ trợ

- Import sinh viên.
- Import lớp.
- Import hoạt động.
- Import đăng ký hoạt động.
- Import điểm danh.
- Import điểm rèn luyện.

## 5.5. Export đề xuất

- Danh sách sinh viên theo lớp.
- Danh sách tham gia hoạt động.
- Báo cáo điểm danh.
- Báo cáo điểm rèn luyện theo học kỳ.
- Báo cáo tổng hợp theo khoa/lớp.

## 5.6. Database đề xuất

```text
import_jobs
- id
- type
- filename
- uploaded_by
- status
- total_rows
- valid_rows
- invalid_rows
- created_at
- completed_at
```

```text
import_job_errors
- id
- import_job_id
- row_number
- field
- message
- raw_value
```

## 5.7. Tiêu chí hoàn thành

- Upload file có preview.
- Lỗi được hiển thị theo từng dòng.
- Có xác nhận trước khi import thật.
- Có lịch sử import.
- Export đúng định dạng và tên file rõ ràng.

---

# Giai đoạn 6 — Face Attendance bằng RetinaFace + ArcFace

## 6.1. Trạng thái hiện tại trong codebase

Phần điểm danh khuôn mặt không còn là ý tưởng tương lai: hệ thống đã có nền tảng end-to-end ở cả frontend, backend, database và Python AI service.

Các thành phần đã tồn tại:

- Python AI service: `face-recognition-service/app/main.py`.
- Backend module: `backend/src/modules/face-recognition`.
- Frontend feature: `frontend/src/features/face-recognition`.
- Database model: `DuLieuKhuonMat` trong `backend/prisma/schema.prisma`.
- Điểm danh đã hỗ trợ `phuong_thuc = khuon_mat` và `do_tin_cay_nhan_dien` trong bảng `diem_danh`.

## 6.2. Những phần đã hoàn thành

### AI service

`face-recognition-service/app/main.py` đang dùng InsightFace model `buffalo_l`, trong đó có pipeline RetinaFace/ArcFace:

- RetinaFace/InsightFace để detect khuôn mặt, bounding box và landmarks.
- ArcFace/InsightFace để trích xuất embedding chuẩn 512 chiều.
- Endpoint `/detect` phát hiện khuôn mặt.
- Endpoint `/embed` trích xuất embedding.
- Endpoint `/verify` so sánh 2 embedding bằng cosine similarity.
- Endpoint `/register` đăng ký 1 ảnh.
- Endpoint `/register-multi` đăng ký nhiều ảnh và lấy average embedding.
- Endpoint `/health` trả detector/embedder đang dùng.

Service cũng đã có liveness heuristic cơ bản:

- Laplacian variance để phát hiện ảnh mờ/chụp lại.
- Texture score qua Sobel.
- Color distribution score.
- Ngưỡng cấu hình qua `LIVENESS_THRESHOLD`.

### Backend

Backend đã có module riêng đúng hướng 3 tầng:

```text
backend/src/modules/face-recognition
├── business
│   ├── interfaces
│   └── services
├── data
│   └── repositories
├── presentation
│   ├── controllers
│   └── routes
└── services
```

Các API chính:

```text
GET    /api/face/health
GET    /api/face/status
POST   /api/face/register
POST   /api/face/attendance/:activityId
DELETE /api/face/register
```

Business logic đã có:

- `RegisterFaceUseCase`: đăng ký/cập nhật khuôn mặt, hỗ trợ nhiều ảnh, kiểm tra embedding 512 chiều.
- `FaceAttendanceUseCase`: kiểm tra sinh viên, hoạt động, đăng ký đã duyệt, chưa điểm danh, extract embedding và verify similarity.
- `GetFaceStatusUseCase`: lấy trạng thái đăng ký khuôn mặt.
- `FaceDataRepository`: thao tác với `du_lieu_khuon_mat`, tạo điểm danh `khuon_mat`, cập nhật đăng ký sang `da_tham_gia`.

Các điểm tốt đã có:

- Không cho client override threshold khi điểm danh; backend dùng threshold server-side.
- Có rate limiter `faceLimiter`.
- Upload dùng memory storage, giới hạn 5MB/file và tối đa 5 file.
- Chỉ nhận JPEG/PNG/WebP.
- Có kiểm tra trùng khuôn mặt với sinh viên khác bằng cosine similarity.
- Có delete face data cho sinh viên.

### Frontend

Frontend đã có feature riêng:

```text
frontend/src/features/face-recognition
├── services/faceApi.ts
├── model/hooks/useFaceRecognition.ts
├── lib/utils.ts
└── ui
    ├── components
    └── pages
```

Đã tích hợp vào các màn hình:

- Profile sinh viên: `FaceRegistrationPageContent`.
- Profile lớp trưởng/monitor: cũng import `FaceRegistrationPageContent`.
- QR scanner: `FaceAttendanceCard` trong `QRScannerModernPage`.
- Student activity detail: `FaceAttendanceCard`.
- Common activity detail page: `FaceAttendanceCard`.

Frontend đã có:

- service API `/face/*`;
- hook quản lý health/status/camera/register/attendance/delete;
- camera capture;
- auto scan khuôn mặt mỗi 2.5 giây trong `FaceAttendanceCard`;
- validation file ảnh 5MB, JPEG/PNG/WebP;
- UI đăng ký, cập nhật, xóa dữ liệu khuôn mặt.

### Database

Đã có model:

```text
DuLieuKhuonMat
- id
- sinh_vien_id
- vector_dac_trung Float[]
- anh_khuon_mat
- da_xac_minh
- so_anh_dang_ky
- ngay_tao
- ngay_cap_nhat
```

Bảng điểm danh đã có:

```text
DiemDanh
- phuong_thuc: qr | ma_vach | truyen_thong | khuon_mat
- do_tin_cay_nhan_dien
```

## 6.3. Đánh giá mức hoàn thiện

| Hạng mục | Trạng thái | Nhận xét |
|---|---|---|
| AI detect face | Đã có | Dùng InsightFace/RetinaFace qua `buffalo_l`. |
| ArcFace embedding | Đã có | Embedding 512 chiều, validate dimension. |
| Verify similarity | Đã có | Cosine similarity, threshold server-side 0.68. |
| Đăng ký nhiều ảnh | Đã có | Average embedding từ 1-5 ảnh. |
| Kiểm tra trùng khuôn mặt | Đã có | So với toàn bộ embedding hiện có. |
| Điểm danh khuôn mặt | Đã có | Tạo `diem_danh` với `phuong_thuc = khuon_mat`. |
| Tích hợp frontend | Đã có | Profile, QR scanner, activity detail. |
| Liveness cơ bản | Đã có một phần | Heuristic ảnh tĩnh, chưa có challenge động. |
| Consent sinh trắc học | Chưa rõ/thiếu | Cần checkbox/chính sách trước khi đăng ký. |
| Mã hóa embedding | Chưa thấy | Vector đang lưu Float[] trực tiếp. |
| Audit log riêng cho face | Thiếu | Hiện chỉ ghi vào `diem_danh.ghi_chu`. |
| Admin/teacher review face data | Thiếu | Có `da_xac_minh` nhưng chưa thấy workflow xác minh. |
| Fallback khi face fail | Thiếu | Nên nối với OTP/thủ công/QR. |
| Monitoring AI service | Có health cơ bản | Chưa có dashboard latency/error/model version. |
| Test end-to-end | Chưa thấy đầy đủ | Cần integration test cho `/face/*` và UI smoke test. |

Kết luận: phần Face Attendance đã đạt mức MVP kỹ thuật, không nên mô tả là “triển khai từ đầu”. Giai đoạn tiếp theo nên là hoàn thiện bảo mật, UX, vận hành và chống spoof nâng cao.

## 6.4. Các điểm cần hoàn thiện trước khi coi là production-ready

### 1. Consent và quyền riêng tư

Cần bổ sung luồng đồng ý trước khi sinh viên đăng ký khuôn mặt:

- giải thích dữ liệu nào được thu thập;
- mục đích sử dụng;
- thời gian lưu trữ;
- quyền xóa dữ liệu;
- ai có quyền truy cập;
- checkbox xác nhận đồng ý.

Database có thể thêm:

```text
face_consents
- id
- sinh_vien_id
- consent_version
- accepted_at
- revoked_at
- ip_address
- user_agent
```

### 2. Bảo vệ embedding sinh trắc học

Hiện `vector_dac_trung` đang lưu trực tiếp dạng `Float[]`. Nên nâng cấp:

- mã hóa embedding ở application layer trước khi lưu;
- hoặc dùng field binary encrypted;
- tách quyền truy cập embedding khỏi các repository thông thường;
- không trả embedding về frontend;
- ghi log mọi lần đọc/xóa/cập nhật embedding.

### 3. Liveness challenge động

Liveness hiện tại là heuristic ảnh tĩnh. Nên nâng cấp theo hướng challenge random:

- chớp mắt;
- quay mặt trái/phải;
- nhìn lên/xuống;
- mở miệng;
- đổi challenge theo phiên.

Luồng đề xuất:

```text
POST /face/challenge/start
POST /face/challenge/verify-step
POST /face/attendance/:activityId với challengeSessionId
```

### 4. Fallback khi AI từ chối

Khi face attendance fail, không nên chỉ báo lỗi. Cần cho sinh viên tạo yêu cầu xác minh:

- ảnh chụp hiện tại;
- lý do fail;
- activityId;
- similarity/liveness score;
- trạng thái `pending_review`.

Giảng viên/lớp trưởng có thể duyệt/từ chối.

### 5. Workflow xác minh dữ liệu khuôn mặt

Schema có `da_xac_minh` nhưng cần workflow rõ:

- Sinh viên đăng ký khuôn mặt xong → `da_xac_minh = false`.
- Giảng viên/Admin xem danh sách đăng ký mới.
- Người có quyền duyệt xác nhận ảnh đúng sinh viên.
- Sau khi duyệt → `da_xac_minh = true`.
- Chỉ cho điểm danh khuôn mặt nếu `da_xac_minh = true`, hoặc cho phép cấu hình theo hệ thống.

### 6. Model version và calibration

Cần lưu model version để sau này đổi model không làm mất khả năng audit:

```text
DuLieuKhuonMat
- model_name
- model_version
- detector_name
- embedding_dim
- threshold_used
```

Nên có script đánh giá threshold trên dữ liệu thật để chọn ngưỡng phù hợp thay vì cố định 0.68.

### 7. Monitoring vận hành AI service

Health hiện có chỉ báo service/models loaded. Nên bổ sung:

- latency trung bình detect/embed/verify;
- tỷ lệ fail liveness;
- tỷ lệ face mismatch;
- số request theo giờ;
- lỗi tải model;
- phiên bản model đang chạy.

### 8. Tối ưu hiệu năng

Các điểm cần xem xét:

- warm-up model khi khởi động;
- giới hạn concurrency cho AI service;
- queue request nếu nhiều sinh viên điểm danh cùng lúc;
- cache health/model metadata;
- dùng GPU provider nếu deploy production có GPU;
- tránh scan auto quá dày ở frontend nếu server quá tải.

Hiện `FaceAttendanceCard` auto capture mỗi 2.5 giây. Khi nhiều sinh viên dùng cùng lúc, nên thêm backoff khi request fail hoặc khi service bận.

## 6.5. Đề xuất nâng cao phù hợp với web này

Ưu tiên 1 — Hoàn thiện bảo mật và UX:

1. Consent trước khi đăng ký khuôn mặt.
2. Không cho điểm danh nếu face data chưa `da_xac_minh`.
3. Fallback request khi face fail.
4. Hiển thị lý do fail thân thiện hơn: không thấy mặt, nhiều mặt, ảnh mờ, liveness fail, mismatch.
5. Admin/giảng viên có trang duyệt/xác minh face registration.

Ưu tiên 2 — Chống spoof nâng cao:

1. Challenge liveness random.
2. Kiểm tra nhiều frame thay vì một ảnh đơn.
3. So sánh biến thiên landmark qua video ngắn.
4. Tùy chọn YOLOv8 phát hiện điện thoại/tablet nếu muốn demo chống replay attack.

Ưu tiên 3 — Vận hành production:

1. Metrics cho AI service.
2. Queue/concurrency limit.
3. Model versioning.
4. Threshold calibration.
5. Integration tests cho `/face/register`, `/face/attendance/:activityId`, `/face/status`.

Ưu tiên 4 — Tích hợp với QR/geofencing:

Face attendance nên là một lớp xác thực trong policy điểm danh, không phải flow tách biệt hoàn toàn.

Ví dụ policy:

```text
Điểm danh hợp lệ nếu:
- activity đang mở;
- sinh viên đã đăng ký và được duyệt;
- chưa điểm danh;
- và thỏa một trong các phương án:
  1. QR động + geofencing pass;
  2. Face pass + geofencing pass;
  3. fallback được giảng viên duyệt.
```

## 6.6. Tiêu chí hoàn thiện giai đoạn tiếp theo

- Có consent trước khi lưu embedding.
- Có workflow admin/teacher xác minh `da_xac_minh`.
- Điểm danh face chỉ dùng face data đã xác minh.
- Có fallback request khi AI fail.
- Có audit log riêng cho đăng ký/xóa/cập nhật/điểm danh khuôn mặt.
- Có model metadata/version trong dữ liệu face.
- Có test backend cho các endpoint `/face/*`.
- Có smoke test frontend cho profile registration và face attendance card.
- Có monitoring health/latency/error rate của Python service.

---

# Giai đoạn 7 — Audit log / Hash chain

## 7.1. Vấn đề cần giải quyết

Dữ liệu điểm danh và điểm rèn luyện có tính nhạy cảm. Cần biết:

- ai đã sửa;
- sửa lúc nào;
- sửa từ giá trị nào sang giá trị nào;
- có ai can thiệp trực tiếp vào database không.

## 7.2. Mục tiêu

Tạo cơ chế audit log có tính toàn vẹn cao, gần giống blockchain nhưng dễ triển khai hơn.

## 7.3. Vì sao không dùng blockchain ngay

Blockchain thật có nhiều chi phí:

- phức tạp vận hành;
- cần ví, gas, testnet/mainnet;
- khó tích hợp vào nghiệp vụ trường học;
- khó sửa lỗi khi triển khai sai.

Với hệ thống này, hash chain trong database là lựa chọn thực tế hơn.

## 7.4. Thiết kế hash chain

Mỗi log chứa hash của log trước đó. Bước triển khai đầu tiên trong web này dùng bảng append-only `nhat_ky_toan_ven_du_lieu` để bảo vệ các luồng điểm danh, đăng ký tham gia và dữ liệu khuôn mặt.

```text
nhat_ky_toan_ven_du_lieu
- id
- chain_scope
- sequence
- entity_type
- entity_id
- action
- actor_id
- request_id
- ip_address
- user_agent
- payload
- payload_hash
- previous_hash
- record_hash
- created_at
```

Cách tính hash:

```text
payload_hash = SHA256(canonical_json(payload))
record_hash = SHA256(chain_scope + sequence + entity_type + entity_id + action + payload_hash + previous_hash + created_at)
```

Nếu ai sửa một log cũ, toàn bộ chuỗi hash sau đó sẽ không còn hợp lệ. Nếu ai sửa payload trong log, `payload_hash` không còn khớp. Với dữ liệu sinh trắc học, audit payload chỉ lưu hash của vector khuôn mặt, không lưu lại embedding thô.

## 7.5. Các hành động cần audit

- tạo/sửa/xóa hoạt động;
- duyệt/từ chối đăng ký;
- điểm danh QR;
- điểm danh khuôn mặt;
- check-in thủ công/cập nhật trạng thái đăng ký sang đã tham gia;
- đăng ký/cập nhật/xóa dữ liệu khuôn mặt;
- sửa trạng thái điểm danh;
- cộng/trừ điểm rèn luyện;
- cấp chứng chỉ;
- thay đổi phân quyền;
- import dữ liệu;
- duyệt fallback attendance.

## 7.6. UI đề xuất

Admin có trang:

- xem lịch sử thay đổi;
- lọc theo người thao tác;
- lọc theo loại dữ liệu;
- xem chi tiết old/new value;
- kiểm tra integrity của hash chain.

## 7.7. Tiêu chí hoàn thành

- Mọi thao tác quan trọng đều ghi audit log.
- Log có hash liên kết.
- Admin xem được lịch sử.
- Có endpoint verify integrity, ví dụ `GET /api/core/admin/audit-integrity/verify?scope=attendance`.

---

# Giai đoạn 8 — Blockchain / Smart Contract / IPFS

## 8.1. Vai trò

Đây là giai đoạn nghiên cứu hoặc mở rộng tương lai, không nên đưa vào core system ngay từ đầu.

## 8.2. Blockchain

Có thể dùng để lưu bằng chứng bất biến cho:

- điểm danh đã xác nhận;
- điểm rèn luyện đã chốt;
- chứng chỉ đã cấp.

Khuyến nghị:

- không lưu dữ liệu cá nhân trực tiếp lên blockchain;
- chỉ lưu hash;
- dữ liệu thật vẫn nằm trong database/backend;
- blockchain chỉ dùng để verify integrity.

## 8.3. Smart Contract

Có thể dùng để tự động hóa:

- cấp chứng chỉ số;
- xác nhận sinh viên đã đạt điều kiện;
- lưu hash điểm rèn luyện cuối kỳ.

Tuy nhiên, trước khi dùng smart contract thật, nên triển khai rule engine trong backend.

Rule engine ví dụ:

```text
Nếu sinh viên tham gia đủ số hoạt động bắt buộc
và tổng điểm >= ngưỡng
và học kỳ đã chốt
=> cấp chứng chỉ
```

## 8.4. IPFS

IPFS có thể dùng để lưu:

- ảnh minh chứng;
- chứng chỉ PDF;
- file bằng chứng điểm danh.

Không nên lưu dữ liệu nhạy cảm chưa mã hóa.

## 8.5. Kiến trúc mở rộng đề xuất

```text
Core Backend
  -> Audit Hash Service
  -> Certificate Service
  -> Blockchain Adapter
      -> Smart Contract
      -> IPFS Storage
```

Module blockchain nên là adapter riêng, để khi không dùng blockchain thì core system vẫn chạy bình thường.

## 8.6. Tiêu chí hoàn thành nếu làm demo

- Có thể phát hành chứng chỉ số demo.
- Lưu hash chứng chỉ lên blockchain testnet.
- Lưu file chứng chỉ lên IPFS hoặc storage tương đương.
- Có màn hình verify chứng chỉ bằng hash.

## 8.7. Rủi ro

- Phức tạp vận hành.
- Dữ liệu đưa lên blockchain khó xóa.
- Có thể vi phạm quyền riêng tư nếu lưu sai dữ liệu.
- Không phù hợp nếu chỉ cần audit nội bộ.

---

# Lộ trình triển khai đề xuất

## Sprint 1

Triển khai QR động:

- attendance session;
- QR token hết hạn;
- countdown frontend;
- validate token backend.

## Sprint 2

Triển khai Geofencing:

- lưu tọa độ hoạt động;
- gửi vị trí khi scan;
- kiểm tra bán kính;
- thông báo lỗi rõ ràng.

## Sprint 3

Triển khai fallback thủ công:

- tạo yêu cầu xác minh;
- giảng viên/lớp trưởng duyệt;
- admin audit.

## Sprint 4

Triển khai Offline-first:

- queue local;
- auto sync;
- trạng thái pending/synced/failed;
- backend validate timestamp/token.

## Sprint 5

Triển khai Dashboard nâng cao:

- dashboard admin;
- dashboard giảng viên;
- dashboard lớp trưởng;
- dashboard sinh viên.

## Sprint 6

Triển khai ETL:

- import preview;
- validate file;
- confirm import;
- export báo cáo.

## Sprint 7

Triển khai Audit log/hash chain:

- audit service;
- hash chain;
- admin audit UI;
- verify integrity.

## Sprint 8

Hoàn thiện Face Attendance production-readiness hoặc làm Blockchain demo nếu còn thời gian:

- bổ sung consent trước khi đăng ký dữ liệu khuôn mặt;
- thêm workflow xác minh `da_xac_minh` cho dữ liệu khuôn mặt;
- tạo fallback request khi AI từ chối nhưng sinh viên cần được xét lại;
- ghi audit log riêng cho đăng ký, xóa dữ liệu và điểm danh bằng khuôn mặt;
- theo dõi latency, lỗi, version model và trạng thái Python AI service;
- bổ sung integration/smoke tests cho `/api/face/*` và các flow frontend liên quan;
- chỉ ưu tiên Blockchain demo nếu đồ án cần điểm nhấn bảo mật/phân tán ngoài core system.

---

# Ma trận ưu tiên cuối cùng

| Hạng mục | Trạng thái hiện tại | Ưu tiên tiếp theo | Ghi chú |
|---|---|---|---|
| QR động | Chưa chuẩn hóa đầy đủ | Core | Giảm chia sẻ QR và replay. |
| Geofencing | Chưa hoàn thiện | Core | Cần fallback thủ công cho trường hợp GPS sai. |
| Fallback thủ công | Chưa hoàn thiện | Core | Bắt buộc để tránh khóa sinh viên hợp lệ. |
| Offline-first | Chưa hoàn thiện | Core | Cần queue, sync và validate token/timestamp. |
| Dashboard nâng cao | Chưa hoàn thiện | Core | Dùng dữ liệu điểm danh/hoạt động hiện có. |
| ETL import/export | Chưa hoàn thiện | Core | Nên có preview, validate và confirm import. |
| Audit log/hash chain | Chưa hoàn thiện | Core | Phù hợp hơn blockchain cho hệ thống hiện tại. |
| Face Attendance | Đã có MVP kỹ thuật | Hardening cao | Không triển khai từ đầu; tập trung bảo mật, fallback, audit, test. |
| RetinaFace | Đã có qua InsightFace `buffalo_l` | Duy trì và quản lý version | Dùng cho detect khuôn mặt/bounding box/landmarks. |
| ArcFace | Đã có embedding 512 chiều | Calibration và metadata | Cần quản lý threshold, version model, thống kê false accept/reject. |
| Liveness Detection | Đã có heuristic cơ bản | Nâng cấp challenge động | Heuristic hiện tại chưa đủ chống spoof production. |
| YOLOv8 anti-fraud | Chưa có | Nghiên cứu/demo | Chỉ cần nếu muốn phát hiện điện thoại/ảnh in/hành vi gian lận nâng cao. |
| Blockchain | Chưa có | Nghiên cứu/demo | Không nên đưa vào core nếu audit/hash chain đã đáp ứng minh bạch. |
| Smart Contract | Chưa có | Nghiên cứu/demo | Chỉ phù hợp demo quy trình xác nhận không sửa đổi. |
| IPFS | Chưa có | Nghiên cứu/demo | Tránh lưu dữ liệu nhạy cảm/sinh trắc học lên hệ phân tán. |
| Wi-Fi SSID Check | Không phù hợp web browser | Không khuyến nghị | Browser không đọc SSID ổn định và an toàn. |
| Continuous Tracking | Chưa có | Không khuyến nghị cho core | Dễ ảnh hưởng quyền riêng tư, pin và UX. |
| Phân tích cảm xúc | Chưa có | Không khuyến nghị | Không liên quan trực tiếp đến bài toán điểm danh/rèn luyện. |

---

# Kết luận

Roadmap phù hợp nhất cho hệ thống hiện tại là tiếp tục hoàn thiện các tính năng có giá trị thực tế và ít rủi ro: QR động, Geofencing, Fallback thủ công, Offline-first, Dashboard nâng cao, ETL và Audit log/hash chain.

Face Attendance bằng RetinaFace + ArcFace đã tồn tại dưới dạng MVP kỹ thuật, vì vậy hướng tiếp theo không phải là triển khai AI face từ đầu mà là production hardening: consent sinh trắc học, bảo vệ embedding, xác minh dữ liệu khuôn mặt, dynamic liveness, fallback khi AI fail, audit log, monitoring, calibration threshold và test end-to-end. Blockchain, Smart Contract và IPFS nên để ở mức nghiên cứu hoặc demo, không nên đưa vào core system ngay từ đầu vì chi phí triển khai và vận hành cao hơn nhiều so với lợi ích trước mắt.
