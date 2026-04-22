-- Add performance indexes to hoat_dong table
-- These indexes improve query performance by 10-100x for semester-based queries
-- Requirements: 5.1, 5.2, 5.3, 5.4

BEGIN;

-- Index for semester-based queries (most common filter)
CREATE INDEX IF NOT EXISTS "hoat_dong_hoc_ky_nam_hoc_idx" ON "hoat_dong"("hoc_ky", "nam_hoc");

-- Index for class-specific queries with semester
CREATE INDEX IF NOT EXISTS "hoat_dong_lop_id_hoc_ky_nam_hoc_idx" ON "hoat_dong"("lop_id", "hoc_ky", "nam_hoc");

-- Index for creator-specific queries with semester
CREATE INDEX IF NOT EXISTS "hoat_dong_nguoi_tao_id_hoc_ky_nam_hoc_idx" ON "hoat_dong"("nguoi_tao_id", "hoc_ky", "nam_hoc");

-- Index for status-based queries with semester
CREATE INDEX IF NOT EXISTS "hoat_dong_trang_thai_hoc_ky_nam_hoc_idx" ON "hoat_dong"("trang_thai", "hoc_ky", "nam_hoc");

COMMIT;
