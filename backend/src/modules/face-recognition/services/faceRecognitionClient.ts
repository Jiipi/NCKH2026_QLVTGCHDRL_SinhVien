/**
 * Face Recognition Client
 * ========================
 * HTTP client gọi Python Face Recognition Service
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';
import type {
  IFaceRecognitionClient,
  FaceDetectResponse,
  FaceEmbedResponse,
  FaceVerifyRequest,
  FaceVerifyResponse,
  FaceRegisterResponse,
  FaceRegisterMultiResponse
} from '../business/interfaces';

const FACE_RECOGNITION_URL = process.env.FACE_RECOGNITION_URL || 'http://localhost:5000';

class FaceRecognitionClient implements IFaceRecognitionClient {
  private client: AxiosInstance;

  constructor(baseURL: string = FACE_RECOGNITION_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 180000, // 180s - cần thêm thời gian cho load models lần đầu
      headers: {
        'Accept': 'application/json'
      }
    });

    // Add interceptor to retry with localhost if ENOTFOUND (useful when running backend outside docker)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ENOTFOUND' && error.config && !error.config.__isRetry) {
          console.log('[FaceRecognitionClient] ENOTFOUND, retrying with localhost:5000...');
          error.config.__isRetry = true;
          error.config.baseURL = 'http://localhost:5000';
          return axios.request(error.config);
        }
        return Promise.reject(error);
      }
    );
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
    } catch (error: unknown) {
      const axErr = error as AxiosError<{ detail?: string }>;
      console.error('[FaceRecognitionClient] detectFaces failed:', axErr.message);
      return {
        success: false,
        message: axErr.response?.data?.detail || axErr.message || 'Lỗi phát hiện khuôn mặt',
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
    } catch (error: unknown) {
      const axErr = error as AxiosError<{ detail?: string }>;
      console.error('[FaceRecognitionClient] extractEmbedding failed:', axErr.message);
      return {
        success: false,
        message: axErr.response?.data?.detail || axErr.message || 'Lỗi trích xuất embedding',
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
    } catch (error: unknown) {
      const axErr = error as AxiosError<{ detail?: string }>;
      console.error('[FaceRecognitionClient] verifyEmbeddings failed:', axErr.message);
      return {
        success: false,
        message: axErr.response?.data?.detail || axErr.message || 'Lỗi xác minh embedding',
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

      const response = await this.client.post('/register', formData, {
        headers: formData.getHeaders()
      });

      return response.data;
    } catch (error: unknown) {
      const axErr = error as AxiosError<{ detail?: string; message?: string }>;
      console.error('[FaceRecognitionClient] registerFace failed:', axErr.message);
      console.error('[FaceRecognitionClient] Error response status:', axErr.response?.status);
      console.error('[FaceRecognitionClient] Error response data:', JSON.stringify(axErr.response?.data, null, 2));
      return {
        success: false,
        message: axErr.response?.data?.detail || axErr.response?.data?.message || axErr.message || 'Lỗi đăng ký khuôn mặt',
        embedding: null,
        embedding_dim: 0,
        face_detected: false,
        aligned_face_base64: null
      };
    }
  }

  async registerMultiFace(imageBuffers: Buffer[]): Promise<FaceRegisterMultiResponse> {
    try {
      const formData = new FormData();

      // Append each image buffer as a separate file
      imageBuffers.forEach((buffer, index) => {
        formData.append('files', buffer, {
          filename: `face_${index + 1}.jpg`,
          contentType: 'image/jpeg'
        });
      });

      const response = await this.client.post('/register-multi', formData, {
        headers: formData.getHeaders()
      });

      return response.data;
    } catch (error: unknown) {
      const axErr = error as AxiosError<{ detail?: string; message?: string }>;
      console.error('[FaceRecognitionClient] registerMultiFace failed:', axErr.message);
      console.error('[FaceRecognitionClient] Error response status:', axErr.response?.status);
      return {
        success: false,
        message: axErr.response?.data?.detail || axErr.response?.data?.message || axErr.message || 'Lỗi đăng ký khuôn mặt đa ảnh',
        embedding: null,
        embedding_dim: 0,
        images_processed: 0,
        images_total: imageBuffers.length,
        liveness_scores: [],
        liveness_all_passed: false
      };
    }
  }
}

// Singleton instance
export const faceRecognitionClient = new FaceRecognitionClient();
export default FaceRecognitionClient;
