# Face Recognition Service

Microservice nhận diện khuôn mặt sử dụng **RetinaFace** (phát hiện) và **ArcFace** (trích xuất embedding).

## Công nghệ

- **FastAPI** - Web framework Python
- **DeepFace** - Thư viện tích hợp RetinaFace + ArcFace
- **OpenCV** - Xử lý ảnh
- **Docker** - Containerization

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Health check, kiểm tra models đã load |
| POST | `/detect` | Phát hiện khuôn mặt, trả về bbox + landmarks |
| POST | `/embed` | Trích xuất embedding 512 chiều từ ảnh |
| POST | `/verify` | So sánh 2 embedding, trả về similarity |
| POST | `/register` | Đăng ký: detect + align + embed |

## Chạy Local (Development)

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
cd app && uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

## Chạy với Docker

```bash
# Build image
docker build -t face-recognition-service .

# Run container
docker run -p 5000:5000 -v face_models:/root/.deepface/weights face-recognition-service
```

## Chạy với Docker Compose (trong dự án chính)

```bash
# Từ thư mục gốc dự án
docker compose --profile dev up face-recognition
```

## Test API

```bash
# Health check
curl http://localhost:5000/health

# Đăng ký khuôn mặt
curl -X POST http://localhost:5000/register \
  -F "file=@path/to/face.jpg"

# So sánh 2 embedding
curl -X POST http://localhost:5000/verify \
  -H "Content-Type: application/json" \
  -d '{"embedding1": [...], "embedding2": [...], "threshold": 0.68}'
```

## Models

- **RetinaFace**: Phát hiện khuôn mặt, trả về bounding box và 5 điểm mốc (landmarks)
- **ArcFace**: Trích xuất embedding 512 chiều từ khuôn mặt đã căn chỉnh

Models sẽ tự động download khi lần đầu chạy service (~500MB).

## Ngưỡng nhận diện

- **Mặc định**: Cosine similarity ≥ 0.68
- **Khuyến nghị**: Fine-tune ngưỡng dựa trên dữ liệu thực tế của sinh viên

## Cấu trúc thư mục

```
face-recognition-service/
├── app/
│   ├── __init__.py
│   └── main.py          # FastAPI application
├── Dockerfile
├── requirements.txt
├── .dockerignore
└── README.md
```
