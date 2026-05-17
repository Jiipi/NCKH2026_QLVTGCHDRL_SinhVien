"""
Face Recognition Service - Main FastAPI Application
====================================================
API endpoints cho nhận diện khuôn mặt sử dụng RetinaFace + ArcFace

Endpoints:
- POST /detect      : Phát hiện khuôn mặt trong ảnh
- POST /embed       : Trích xuất embedding từ ảnh khuôn mặt
- POST /verify      : So sánh 2 embedding
- POST /register    : Đăng ký khuôn mặt (detect + align + embed)
- GET  /health      : Health check
"""

import os
import io
import base64
import logging
from typing import List, Optional
from contextlib import asynccontextmanager

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instances (lazy loaded)
insightface_app = None

# Model metadata
MODEL_NAME = 'buffalo_l'
MODEL_VERSION = '1.0.0'
EMBEDDING_DIM = 512

# In-memory metrics
import time as _time
_metrics = {
    'start_time': _time.time(),
    'detect_count': 0,
    'embed_count': 0,
    'verify_count': 0,
    'register_count': 0,
    'register_multi_count': 0,
    'liveness_fail_count': 0,
    'mismatch_count': 0,
    'total_latency_ms': 0.0,
    'request_count': 0,
}

# ============== Pydantic Models ==============

class DetectResponse(BaseModel):
    """Response từ endpoint /detect"""
    success: bool
    message: str
    faces: List[dict] = []
    face_count: int = 0

class EmbedResponse(BaseModel):
    """Response từ endpoint /embed"""
    success: bool
    message: str
    embedding: Optional[List[float]] = None
    embedding_dim: int = 0
    liveness_score: Optional[float] = None
    liveness_passed: Optional[bool] = None
    error_code: Optional[str] = None

class VerifyRequest(BaseModel):
    """Request body cho endpoint /verify"""
    embedding1: List[float]
    embedding2: List[float]
    threshold: float = 0.68  # Ngưỡng cosine similarity mặc định

class VerifyResponse(BaseModel):
    """Response từ endpoint /verify"""
    success: bool
    message: str
    is_match: bool = False
    similarity: float = 0.0
    threshold: float = 0.68

class RegisterResponse(BaseModel):
    """Response từ endpoint /register"""
    success: bool
    message: str
    embedding: Optional[List[float]] = None
    embedding_dim: int = 0
    face_detected: bool = False
    aligned_face_base64: Optional[str] = None
    liveness_score: Optional[float] = None
    liveness_passed: Optional[bool] = None

class RegisterMultiResponse(BaseModel):
    """Response từ endpoint /register-multi"""
    success: bool
    message: str
    embedding: Optional[List[float]] = None
    embedding_dim: int = 0
    images_processed: int = 0
    images_total: int = 0
    liveness_scores: List[float] = []
    liveness_all_passed: bool = False

class HealthResponse(BaseModel):
    """Response từ endpoint /health"""
    status: str
    models_loaded: bool
    detector: str
    embedder: str
    model_name: str = 'buffalo_l'
    model_version: str = '1.0.0'
    embedding_dim: int = 512

# Environment config
LIVENESS_THRESHOLD = float(os.environ.get("LIVENESS_THRESHOLD", "0.5"))

# ============== Helper Functions ==============

def load_models():
    """Lazy load InsightFace FaceAnalysis model"""
    global insightface_app
    
    if insightface_app is None:
        logger.info("Đang tải models InsightFace (buffalo_l)...")
        try:
            import insightface
            # buffalo_l includes RetinaFace feature Pyramid and ArcFace embedding
            insightface_app = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
            insightface_app.prepare(ctx_id=0, det_size=(640, 640))
            logger.info("✅ InsightFace model đã tải thành công")
        except Exception as e:
            logger.error(f"❌ Lỗi tải models: {e}")
            raise

def decode_image(image_bytes: bytes) -> np.ndarray:
    """Decode image bytes to numpy array (RGB)"""
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
        
    img_array = np.array(image)
    
    # Giới hạn kích thước ảnh xuống 640px cho phù hợp input của RetinaFace InsightFace
    max_dim = 640
    h, w = img_array.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        import cv2
        img_array = cv2.resize(img_array, (new_w, new_h), interpolation=cv2.INTER_AREA)
        logger.info(f"Resized image from {w}x{h} to {new_w}x{new_h}")
        
    return img_array

def encode_image_base64(image_array: np.ndarray) -> str:
    """Encode numpy array image to base64 string"""
    image = Image.fromarray(image_array)
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Tính cosine similarity giữa 2 vector"""
    a = np.array(vec1)
    b = np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def check_liveness(image_array: np.ndarray) -> dict:
    """
    Multi-factor liveness detection:
    1. Laplacian variance (blur detection) - ảnh in thường bị mờ khi chụp lại
    2. LBP texture analysis - phát hiện texture bất thường từ màn hình/ảnh in
    3. Color distribution - ảnh từ màn hình có phân bố màu khác ảnh thực
    """
    import cv2
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array

    # Factor 1: Laplacian variance (blur detection)
    laplacian_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # Factor 2: Texture analysis using Local Binary Pattern variance
    # Ảnh từ màn hình/ảnh in có texture đồng đều hơn ảnh thực
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    texture_score = float(np.std(sobelx) + np.std(sobely))

    # Factor 3: Color variance (chỉ khi ảnh có màu)
    color_score = 0.0
    if len(image_array.shape) == 3:
        hsv = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)
        # Ảnh thực có saturation đa dạng hơn ảnh từ màn hình
        color_score = float(np.std(hsv[:, :, 1]))

    # Weighted combination
    # Laplacian: 40%, Texture: 35%, Color: 25%
    combined_score = (laplacian_score / 100.0) * 0.4 + (texture_score / 50.0) * 0.35 + (color_score / 40.0) * 0.25

    passed = laplacian_score >= LIVENESS_THRESHOLD and texture_score >= 10.0

    logger.info(
        f"[Liveness] Laplacian: {laplacian_score:.2f}, "
        f"Texture: {texture_score:.2f}, Color: {color_score:.2f}, "
        f"Combined: {combined_score:.2f}, Passed: {passed}"
    )
    return {
        "score": round(combined_score, 2),
        "laplacian": round(laplacian_score, 2),
        "texture": round(texture_score, 2),
        "passed": passed
    }

# ============== Lifespan Events ==============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - load models on startup"""
    logger.info("🚀 Khởi động Face Recognition Service...")
    try:
        load_models()
        logger.info("✅ Service sẵn sàng!")
    except Exception as e:
        logger.warning(f"⚠️ Models sẽ được tải khi có request đầu tiên: {e}")
    yield
    logger.info("👋 Đang tắt Face Recognition Service...")

# ============== FastAPI App ==============

app = FastAPI(
    title="Face Recognition Service",
    description="API nhận diện khuôn mặt sử dụng RetinaFace + ArcFace",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - chỉ cho phép origins cụ thể, KHÔNG dùng wildcard "*"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ============== API Endpoints ==============

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    models_loaded = insightface_app is not None
    
    return HealthResponse(
        status="healthy" if models_loaded else "starting",
        models_loaded=models_loaded,
        detector="InsightFace_RetinaFace" if models_loaded else "not_loaded",
        embedder="InsightFace_ArcFace" if models_loaded else "not_loaded",
        model_name=MODEL_NAME,
        model_version=MODEL_VERSION,
        embedding_dim=EMBEDDING_DIM
    )

@app.get("/metrics")
async def get_metrics():
    """Metrics endpoint for monitoring"""
    uptime_seconds = _time.time() - _metrics['start_time']
    avg_latency = (_metrics['total_latency_ms'] / _metrics['request_count']) if _metrics['request_count'] > 0 else 0
    return {
        "uptime_seconds": round(uptime_seconds, 1),
        "total_requests": _metrics['request_count'],
        "detect_count": _metrics['detect_count'],
        "embed_count": _metrics['embed_count'],
        "verify_count": _metrics['verify_count'],
        "register_count": _metrics['register_count'],
        "register_multi_count": _metrics['register_multi_count'],
        "liveness_fail_count": _metrics['liveness_fail_count'],
        "mismatch_count": _metrics['mismatch_count'],
        "avg_latency_ms": round(avg_latency, 1),
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION
    }

@app.post("/detect", response_model=DetectResponse)
async def detect_faces(file: UploadFile = File(...)):
    """
    Phát hiện khuôn mặt trong ảnh
    
    - **file**: Ảnh upload (JPEG, PNG)
    - **Returns**: Danh sách khuôn mặt với bounding box và landmarks
    """
    try:
        _start = _time.time()
        load_models()
        
        # Read and decode image
        image_bytes = await file.read()
        image_array = decode_image(image_bytes)
        
        # Detect faces using InsightFace
        faces = insightface_app.get(image_array)
        _metrics['detect_count'] += 1
        _metrics['request_count'] += 1
        _metrics['total_latency_ms'] += (_time.time() - _start) * 1000
        
        if not faces or len(faces) == 0:
            return DetectResponse(
                success=True,
                message="Không tìm thấy khuôn mặt trong ảnh",
                faces=[],
                face_count=0
            )
        
        # Format response
        face_list = []
        for i, face in enumerate(faces):
            bbox = [float(x) for x in face.bbox]
            landmarks = face.kps.tolist() if face.kps is not None else []
            face_list.append({
                "id": str(i),
                "bbox": bbox,
                "confidence": float(face.det_score) if hasattr(face, 'det_score') else 0.99,
                "landmarks": landmarks
            })
        
        return DetectResponse(
            success=True,
            message=f"Phát hiện {len(face_list)} khuôn mặt",
            faces=face_list,
            face_count=len(face_list)
        )
        
    except Exception as e:
        logger.error(f"Lỗi detect_faces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed", response_model=EmbedResponse)
async def extract_embedding(file: UploadFile = File(...)):
    """
    Trích xuất embedding vector 512 chiều từ ảnh khuôn mặt
    
    - **file**: Ảnh khuôn mặt (sẽ tự động detect và align)
    - **Returns**: Vector embedding 512 chiều
    """
    try:
        _start = _time.time()
        load_models()
        
        # Read and decode image
        image_bytes = await file.read()
        image_array = decode_image(image_bytes)
        
        # Liveness check
        liveness = check_liveness(image_array)
        if not liveness["passed"]:
            _metrics['liveness_fail_count'] += 1
            _metrics['embed_count'] += 1
            _metrics['request_count'] += 1
            _metrics['total_latency_ms'] += (_time.time() - _start) * 1000
            return EmbedResponse(
                success=False,
                message=f"Ảnh không đạt kiểm tra liveness (score: {liveness['score']}). Vui lòng sử dụng ảnh chụp trực tiếp.",
                embedding=None,
                embedding_dim=0,
                liveness_score=liveness["score"],
                liveness_passed=False
            )
            
        # Extract embedding using InsightFace
        faces = insightface_app.get(image_array)
        
        if not faces or len(faces) == 0:
            return EmbedResponse(
                success=False,
                message="Không thể trích xuất embedding - không tìm thấy khuôn mặt",
                embedding=None,
                embedding_dim=0,
                liveness_score=liveness["score"],
                liveness_passed=liveness["passed"],
                error_code="NO_FACE"
            )
        
        # Lấy khuôn mặt rõ nhất/to nhất
        faces = sorted(faces, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]), reverse=True)
        
        embedding = [float(x) for x in faces[0].normed_embedding]
        _metrics['embed_count'] += 1
        _metrics['request_count'] += 1
        _metrics['total_latency_ms'] += (_time.time() - _start) * 1000
        
        return EmbedResponse(
            success=True,
            message="Trích xuất embedding thành công",
            embedding=embedding,
            embedding_dim=len(embedding),
            liveness_score=liveness["score"],
            liveness_passed=liveness["passed"]
        )
        
    except ValueError as e:
        # InsightFace có thể raise ValueError khi không phát hiện khuôn mặt
        logger.warning(f"Không tìm thấy khuôn mặt: {e}")
        return EmbedResponse(
            success=False,
            message="Không tìm thấy khuôn mặt trong ảnh",
            embedding=None,
            embedding_dim=0
        )
    except Exception as e:
        logger.error(f"Lỗi extract_embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify", response_model=VerifyResponse)
async def verify_embeddings(request: VerifyRequest):
    """
    So sánh 2 embedding vector để xác minh danh tính
    
    - **embedding1**: Vector embedding thứ nhất (512 chiều)
    - **embedding2**: Vector embedding thứ hai (512 chiều)
    - **threshold**: Ngưỡng similarity (mặc định 0.68)
    - **Returns**: Kết quả so khớp và độ tương đồng
    """
    try:
        if len(request.embedding1) != 512 or len(request.embedding2) != 512:
            raise HTTPException(
                status_code=400,
                detail=f"Embedding phải có 512 chiều. Nhận được: {len(request.embedding1)}, {len(request.embedding2)}"
            )
        
        similarity = cosine_similarity(request.embedding1, request.embedding2)
        is_match = similarity >= request.threshold
        _metrics['verify_count'] += 1
        _metrics['request_count'] += 1
        if not is_match:
            _metrics['mismatch_count'] += 1
        
        return VerifyResponse(
            success=True,
            message="Xác minh thành công" if is_match else "Không khớp",
            is_match=is_match,
            similarity=round(similarity, 4),
            threshold=request.threshold
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lỗi verify_embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register", response_model=RegisterResponse)
async def register_face(file: UploadFile = File(...)):
    """
    Đăng ký khuôn mặt mới: detect + align + extract embedding
    
    - **file**: Ảnh chứa khuôn mặt cần đăng ký
    - **Returns**: Embedding và ảnh khuôn mặt đã căn chỉnh (base64)
    """
    try:
        load_models()
        
        # Read and decode image
        image_bytes = await file.read()
        image_array = decode_image(image_bytes)
        
        # Step 0: Liveness check
        liveness = check_liveness(image_array)
        if not liveness["passed"]:
            return RegisterResponse(
                success=False,
                message=f"Ảnh không đạt kiểm tra liveness (score: {liveness['score']}). Vui lòng chụp ảnh trực tiếp từ camera.",
                face_detected=False,
                liveness_score=liveness["score"],
                liveness_passed=False
            )
            
        # Step 1: Detect and Extract using InsightFace
        faces = insightface_app.get(image_array)
        
        if not faces or len(faces) == 0:
            return RegisterResponse(
                success=False,
                message="Không tìm thấy khuôn mặt trong ảnh",
                face_detected=False,
                liveness_score=liveness["score"],
                liveness_passed=liveness["passed"]
            )
        
        if len(faces) > 1:
            return RegisterResponse(
                success=False,
                message=f"Phát hiện {len(faces)} khuôn mặt. Vui lòng chỉ chụp 1 khuôn mặt",
                face_detected=True,
                liveness_score=liveness["score"],
                liveness_passed=liveness["passed"]
            )
        
        face = faces[0]
        embedding = [float(x) for x in face.normed_embedding]
        
        # Trích xuất ảnh khuôn mặt (cắt theo bbox) để gửi xuống FE
        x1, y1, x2, y2 = [int(v) for v in face.bbox]
        h_i, w_i = image_array.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w_i, x2), min(h_i, y2)
        
        aligned_face = image_array[y1:y2, x1:x2]
        aligned_face_b64 = encode_image_base64(aligned_face)
        
        return RegisterResponse(
            success=True,
            message="Đăng ký khuôn mặt thành công",
            embedding=embedding,
            embedding_dim=len(embedding),
            face_detected=True,
            aligned_face_base64=aligned_face_b64,
            liveness_score=liveness["score"],
            liveness_passed=liveness["passed"]
        )
        
    except Exception as e:
        logger.error(f"Lỗi register_face: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register-multi", response_model=RegisterMultiResponse)
async def register_face_multi(files: List[UploadFile] = File(...)):
    """
    Đăng ký khuôn mặt từ nhiều ảnh. Average embedding giúp tăng độ chính xác.
    """
    try:
        load_models()
        
        if len(files) < 1:
            return RegisterMultiResponse(success=False, message="Cần ít nhất 1 ảnh", images_total=0)
        
        embeddings = []
        liveness_scores = []
        failed_images = []
        
        for i, file in enumerate(files):
            try:
                image_bytes = await file.read()
                image_array = decode_image(image_bytes)
                
                liveness = check_liveness(image_array)
                liveness_scores.append(liveness["score"])
                if not liveness["passed"]:
                    failed_images.append(f"Ảnh {i+1}: liveness fail")
                    continue
                
                faces = insightface_app.get(image_array)
                if not faces or len(faces) == 0:
                    continue
                if len(faces) > 1:
                    continue
                
                embeddings.append([float(x) for x in faces[0].normed_embedding])
            except Exception:
                continue
                
        if len(embeddings) == 0:
            return RegisterMultiResponse(
                success=False,
                message="Không thể trích xuất embedding từ ảnh nào. Liveness hoặc không thấy khuôn mặt.",
                images_total=len(files),
                liveness_scores=liveness_scores,
                liveness_all_passed=False
            )
            
        import numpy as np
        avg_embedding = np.mean(embeddings, axis=0).tolist()
        
        return RegisterMultiResponse(
            success=True,
            message=f"Đăng ký thành công từ {len(embeddings)}/{len(files)} ảnh hợp lệ",
            embedding=avg_embedding,
            embedding_dim=len(avg_embedding),
            images_processed=len(embeddings),
            images_total=len(files),
            liveness_scores=liveness_scores,
            liveness_all_passed=True
        )
    except Exception as e:
        logger.error(f"Lỗi register-multi: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============== Run Server ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
