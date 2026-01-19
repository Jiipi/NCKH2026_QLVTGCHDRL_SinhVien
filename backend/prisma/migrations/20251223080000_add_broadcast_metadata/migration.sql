-- Thêm cột metadata broadcast vào thong_bao để thống kê/lịch sử chính xác
ALTER TABLE "thong_bao"
  ADD COLUMN IF NOT EXISTS "pham_vi_gui" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "vai_tro_nhan" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "lop_nhan_id" UUID,
  ADD COLUMN IF NOT EXISTS "khoa_nhan" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "hoat_dong_nhan_id" UUID,
  ADD COLUMN IF NOT EXISTS "so_nguoi_duoc_chon" INTEGER,
  ADD COLUMN IF NOT EXISTS "so_nguoi_da_gui" INTEGER;
