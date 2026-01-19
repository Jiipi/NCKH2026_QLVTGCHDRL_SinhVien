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
face_detector = None
face_embedder = None

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

class HealthResponse(BaseModel):
    """Response từ endpoint /health"""
    status: str
    models_loaded: bool
    detector: str
    embedder: str

# ============== Helper Functions ==============

def load_models():
    """Lazy load face detection and embedding models"""
    global face_detector, face_embedder
    
    if face_detector is None or face_embedder is None:
        logger.info("Đang tải models RetinaFace và ArcFace...")
        try:
            from deepface import DeepFace
            
            # Build models (triggers download if not cached)
            face_embedder = DeepFace.build_model("ArcFace")
            logger.info("✅ ArcFace model đã tải thành công")
            
            # RetinaFace is loaded automatically by DeepFace when needed
            face_detector = "RetinaFace"
            logger.info("✅ RetinaFace detector sẵn sàng")
            
        except Exception as e:
            logger.error(f"❌ Lỗi tải models: {e}")
            raise

def decode_image(image_bytes: bytes) -> np.ndarray:
    """Decode image bytes to numpy array (RGB)"""
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
    return np.array(image)

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== API Endpoints ==============

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    global face_detector, face_embedder
    
    models_loaded = face_detector is not None and face_embedder is not None
    
    return HealthResponse(
        status="healthy" if models_loaded else "starting",
        models_loaded=models_loaded,
        detector="RetinaFace" if face_detector else "not_loaded",
        embedder="ArcFace" if face_embedder else "not_loaded"
    )

@app.post("/detect", response_model=DetectResponse)
async def detect_faces(file: UploadFile = File(...)):
    """
    Phát hiện khuôn mặt trong ảnh
    
    - **file**: Ảnh upload (JPEG, PNG)
    - **Returns**: Danh sách khuôn mặt với bounding box và landmarks
    """
    try:
        load_models()
        
        # Read and decode image
        image_bytes = await file.read()
        image_array = decode_image(image_bytes)
        
        # Detect faces using RetinaFace via DeepFace
        from retinaface import RetinaFace
        faces = RetinaFace.detect_faces(image_array)
        
        if not faces or len(faces) == 0:
            return DetectResponse(
                success=True,
                message="Không tìm thấy khuôn mặt trong ảnh",
                faces=[],
                face_count=0
            )
        
        # Format response
        face_list = []
        for face_id, face_data in faces.items():
            face_list.append({
                "id": face_id,
                "bbox": face_data["facial_area"],  # [x1, y1, x2, y2]
                "confidence": float(face_data["score"]),
                "landmarks": face_data["landmarks"]  # eyes, nose, mouth corners
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
        load_models()
        
        # Read and decode image
        image_bytes = await file.read()
        image_array = decode_image(image_bytes)
        
        # Extract embedding using DeepFace + ArcFace
        from deepface import DeepFace
        
        result = DeepFace.represent(
            img_path=image_array,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=True,
            align=True
        )
        
        if not result or len(result) == 0:
            return EmbedResponse(
                success=False,
                message="Không thể trích xuất embedding - không tìm thấy khuôn mặt",
                embedding=None,
                embedding_dim=0
            )
        
        embedding = result[0]["embedding"]
        
        return EmbedResponse(
            success=True,
            message="Trích xuất embedding thành công",
            embedding=embedding,
            embedding_dim=len(embedding)
        )
        
    except ValueError as e:
        # DeepFace raises ValueError when no face detected
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
        
        from deepface import DeepFace
        from retinaface import RetinaFace
        
        # Step 1: Detect faces
        faces = RetinaFace.detect_faces(image_array)
        
        if not faces or len(faces) == 0:
            return RegisterResponse(
                success=False,
                message="Không tìm thấy khuôn mặt trong ảnh",
                face_detected=False
            )
        
        if len(faces) > 1:
            return RegisterResponse(
                success=False,
                message=f"Phát hiện {len(faces)} khuôn mặt. Vui lòng chỉ chụp 1 khuôn mặt",
                face_detected=True
            )
        
        # Step 2: Extract aligned face
        aligned_faces = RetinaFace.extract_faces(image_array, align=True)
        
        if not aligned_faces or len(aligned_faces) == 0:
            return RegisterResponse(
                success=False,
                message="Không thể căn chỉnh khuôn mặt",
                face_detected=True
            )
        
        aligned_face = aligned_faces[0]
        aligned_face_b64 = encode_image_base64((aligned_face * 255).astype(np.uint8))
        
        # Step 3: Extract embedding
        result = DeepFace.represent(
            img_path=image_array,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=True,
            align=True
        )
        
        if not result or len(result) == 0:
            return RegisterResponse(
                success=False,
                message="Không thể trích xuất đặc trưng khuôn mặt",
                face_detected=True
            )
        
        embedding = result[0]["embedding"]
        
        return RegisterResponse(
            success=True,
            message="Đăng ký khuôn mặt thành công",
            embedding=embedding,
            embedding_dim=len(embedding),
            face_detected=True,
            aligned_face_base64=aligned_face_b64
        )
        
    except Exception as e:
        logger.error(f"Lỗi register_face: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============== Run Server ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
