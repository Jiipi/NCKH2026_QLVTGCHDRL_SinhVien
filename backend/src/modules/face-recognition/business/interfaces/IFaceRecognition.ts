/**
 * Face Recognition Module - Business Interfaces
 * ===============================================
 * Interface definitions cho face recognition service
 */

/**
 * Response từ Python Face Recognition Service
 */
export interface FaceDetectResponse {
  success: boolean;
  message: string;
  faces: Array<{
    id: string;
    bbox: number[];
    confidence: number;
    landmarks: Record<string, number[]>;
  }>;
  face_count: number;
}

export interface FaceEmbedResponse {
  success: boolean;
  message: string;
  embedding: number[] | null;
  embedding_dim: number;
}

export interface FaceVerifyRequest {
  embedding1: number[];
  embedding2: number[];
  threshold?: number;
}

export interface FaceVerifyResponse {
  success: boolean;
  message: string;
  is_match: boolean;
  similarity: number;
  threshold: number;
}

export interface FaceRegisterResponse {
  success: boolean;
  message: string;
  embedding: number[] | null;
  embedding_dim: number;
  face_detected: boolean;
  aligned_face_base64: string | null;
}

/**
 * Interface cho Face Recognition Service Client
 */
export interface IFaceRecognitionClient {
  /**
   * Kiểm tra service có sẵn sàng không
   */
  healthCheck(): Promise<{ status: string; models_loaded: boolean }>;
  
  /**
   * Phát hiện khuôn mặt trong ảnh
   */
  detectFaces(imageBuffer: Buffer): Promise<FaceDetectResponse>;
  
  /**
   * Trích xuất embedding từ ảnh khuôn mặt
   */
  extractEmbedding(imageBuffer: Buffer): Promise<FaceEmbedResponse>;
  
  /**
   * So sánh 2 embedding
   */
  verifyEmbeddings(request: FaceVerifyRequest): Promise<FaceVerifyResponse>;
  
  /**
   * Đăng ký khuôn mặt: detect + align + embed
   */
  registerFace(imageBuffer: Buffer): Promise<FaceRegisterResponse>;
}

/**
 * Dữ liệu khuôn mặt từ database
 */
export interface DuLieuKhuonMatData {
  id: string;
  sinh_vien_id: string;
  vector_dac_trung: number[];
  anh_khuon_mat: string | null;
  da_xac_minh: boolean;
  so_anh_dang_ky: number;
  ngay_tao: Date;
  ngay_cap_nhat: Date;
}

/**
 * Interface cho Face Data Repository
 */
export interface IFaceDataRepository {
  /**
   * Tìm dữ liệu khuôn mặt theo sinh viên ID
   */
  findBySinhVienId(sinhVienId: string): Promise<DuLieuKhuonMatData | null>;
  
  /**
   * Lưu dữ liệu khuôn mặt mới
   */
  create(data: {
    sinh_vien_id: string;
    vector_dac_trung: number[];
    anh_khuon_mat?: string;
    so_anh_dang_ky?: number;
  }): Promise<DuLieuKhuonMatData>;
  
  /**
   * Cập nhật dữ liệu khuôn mặt
   */
  update(id: string, data: {
    vector_dac_trung?: number[];
    anh_khuon_mat?: string;
    da_xac_minh?: boolean;
    so_anh_dang_ky?: number;
  }): Promise<DuLieuKhuonMatData>;
  
  /**
   * Xóa dữ liệu khuôn mặt
   */
  delete(id: string): Promise<void>;
  
  /**
   * Kiểm tra sinh viên đã đăng ký khuôn mặt chưa
   */
  existsBySinhVienId(sinhVienId: string): Promise<boolean>;
}
