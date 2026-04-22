-- Add performance indexes to registration and related tables
-- These indexes improve registration queries and class roster lookups
-- Requirements: 5.5, 5.6, 5.7

BEGIN;

-- Index for student registration queries by status
CREATE INDEX IF NOT EXISTS "dang_ky_hoat_dong_sv_id_trang_thai_dk_idx" ON "dang_ky_hoat_dong"("sv_id", "trang_thai_dk");

-- Index for activity registration queries by status
CREATE INDEX IF NOT EXISTS "dang_ky_hoat_dong_hd_id_trang_thai_dk_idx" ON "dang_ky_hoat_dong"("hd_id", "trang_thai_dk");

-- Index for class roster queries
CREATE INDEX IF NOT EXISTS "sinh_vien_lop_id_idx" ON "sinh_vien"("lop_id");

-- Index for teacher's classes queries
CREATE INDEX IF NOT EXISTS "lop_chu_nhiem_idx" ON "lop"("chu_nhiem");

COMMIT;
