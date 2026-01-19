/**
 * Face Recognition Client
 * ========================
 * HTTP client gọi Python Face Recognition Service
 */

import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import type {
  IFaceRecognitionClient,
  FaceDetectResponse,
  FaceEmbedResponse,
  FaceVerifyRequest,
  FaceVerifyResponse,
  FaceRegisterResponse
} from '../business/interfaces';

const FACE_RECOGNITION_URL = process.env.FACE_RECOGNITION_URL || 'http://localhost:5000';

class FaceRecognitionClient implements IFaceRecognitionClient {
  private client: AxiosInstance;

  constructor(baseURL: string = FACE_RECOGNITION_URL) {
    console.log('[FaceRecognitionClient] Initializing with baseURL:', baseURL);
    this.client = axios.create({
      baseURL,
      timeout: 180000, // 180s - cần thêm thời gian cho load models lần đầu
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  async healthCheck(): Promise<{ status: string; models_loaded: boolean }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('[FaceRecognitionClient] Health check failed:', error);
      return { status: 'unhealthy', models_loaded: false };
    }
  }

  async detectFaces(imageBuffer: Buffer): Promise<FaceDetectResponse> {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });

      const response = await this.client.post('/detect', formData, {
        headers: formData.getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('[FaceRecognitionClient] detectFaces failed:', error.message);
      return {
        success: false,
        message: error.response?.data?.detail || error.message || 'Lỗi phát hiện khuôn mặt',
        faces: [],
        face_count: 0
      };
    }
  }

  async extractEmbedding(imageBuffer: Buffer): Promise<FaceEmbedResponse> {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });

      const response = await this.client.post('/embed', formData, {
        headers: formData.getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('[FaceRecognitionClient] extractEmbedding failed:', error.message);
      return {
        success: false,
        message: error.response?.data?.detail || error.message || 'Lỗi trích xuất embedding',
        embedding: null,
        embedding_dim: 0
      };
    }
  }

  async verifyEmbeddings(request: FaceVerifyRequest): Promise<FaceVerifyResponse> {
    try {
      const response = await this.client.post('/verify', {
        embedding1: request.embedding1,
        embedding2: request.embedding2,
        threshold: request.threshold || 0.68
      });

      return response.data;
    } catch (error: any) {
      console.error('[FaceRecognitionClient] verifyEmbeddings failed:', error.message);
      return {
        success: false,
        message: error.response?.data?.detail || error.message || 'Lỗi xác minh embedding',
        is_match: false,
        similarity: 0,
        threshold: request.threshold || 0.68
      };
    }
  }

  async registerFace(imageBuffer: Buffer): Promise<FaceRegisterResponse> {
    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });

      console.log('[FaceRecognitionClient] Sending register request to Python service...');
      console.log('[FaceRecognitionClient] Image buffer size:', imageBuffer.length, 'bytes');

      const response = await this.client.post('/register', formData, {
        headers: formData.getHeaders()
      });

      console.log('[FaceRecognitionClient] Python response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FaceRecognitionClient] registerFace failed:', error.message);
      console.error('[FaceRecognitionClient] Error response status:', error.response?.status);
      console.error('[FaceRecognitionClient] Error response data:', JSON.stringify(error.response?.data, null, 2));
      return {
        success: false,
        message: error.response?.data?.detail || error.response?.data?.message || error.message || 'Lỗi đăng ký khuôn mặt',
        embedding: null,
        embedding_dim: 0,
        face_detected: false,
        aligned_face_base64: null
      };
    }
  }
}

// Singleton instance
export const faceRecognitionClient = new FaceRecognitionClient();
export default FaceRecognitionClient;
