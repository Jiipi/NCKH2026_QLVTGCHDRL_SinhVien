/**
 * Dashboard UI Layer - Barrel Export
 *
 * Theo kiến trúc 3 tầng:
 * - shared/: các component tái sử dụng giữa các dashboard pages
 * - pages/ : chứa từng trang cụ thể (admin, teacher, monitor, student)
 */

export * from './shared';
export * from './pages';
