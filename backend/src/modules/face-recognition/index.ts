/**
 * Face Recognition Module
 * ========================
 * Module nhận diện khuôn mặt sử dụng RetinaFace + ArcFace
 * 
 * Features:
 * - Đăng ký khuôn mặt cho sinh viên
 * - Điểm danh bằng khuôn mặt
 * - Quản lý dữ liệu khuôn mặt
 * 
 * Structure:
 * - business/          : Use cases và interfaces
 * - data/              : Repositories
 * - presentation/      : Controllers và routes
 * - services/          : External service clients
 */

// Business layer
export * from './business';

// Data layer
export * from './data';

// Presentation layer
export * from './presentation';

// Services
export * from './services';
