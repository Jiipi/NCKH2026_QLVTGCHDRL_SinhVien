-- Reconcile an existing production database after squashing old migrations.
-- This migration is intentionally idempotent: production marks the baseline as
-- applied, then this file fills gaps between the current Docker DB and schema.prisma.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrangThaiPhienQr') THEN
    CREATE TYPE "TrangThaiPhienQr" AS ENUM ('dang_mo', 'da_dong', 'het_han');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KetQuaGeofence') THEN
    CREATE TYPE "KetQuaGeofence" AS ENUM ('trong_vung', 'ngoai_vung', 'khong_co_gps', 'khong_yeu_cau');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrangThaiYeuCauDiemDanh') THEN
    CREATE TYPE "TrangThaiYeuCauDiemDanh" AS ENUM ('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ImportStatus') THEN
    CREATE TYPE "ImportStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ImportType') THEN
    CREATE TYPE "ImportType" AS ENUM ('student', 'activity', 'class', 'registration', 'attendance');
  END IF;
END $$;

ALTER TYPE "PhuongThucDiemDanh" ADD VALUE IF NOT EXISTS 'khuon_mat';
ALTER TYPE "PhuongThucDiemDanh" ADD VALUE IF NOT EXISTS 'thu_cong_fallback';

ALTER TABLE "nguoi_dung"
  ADD COLUMN IF NOT EXISTS "ma_xac_minh" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "tg_het_han_ma" TIMESTAMP(6);

ALTER TABLE "sinh_vien"
  ADD COLUMN IF NOT EXISTS "email" VARCHAR(100);

ALTER TABLE "hoat_dong"
  ADD COLUMN IF NOT EXISTS "lop_id" UUID,
  ADD COLUMN IF NOT EXISTS "geo_latitude" DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS "geo_longitude" DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS "geo_radius_meters" INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "yeu_cau_gps" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "cho_phep_fallback" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "dang_ky_hoat_dong"
  ADD COLUMN IF NOT EXISTS "nguoi_duyet_id" UUID;

ALTER TABLE "diem_danh"
  ADD COLUMN IF NOT EXISTS "gps_latitude" DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS "gps_longitude" DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS "gps_accuracy_m" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "khoang_cach_m" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "ket_qua_geofence" "KetQuaGeofence",
  ADD COLUMN IF NOT EXISTS "fallback_request_id" UUID,
  ADD COLUMN IF NOT EXISTS "do_tin_cay_nhan_dien" DOUBLE PRECISION;

ALTER TABLE "thong_bao"
  ADD COLUMN IF NOT EXISTS "pham_vi_gui" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "vai_tro_nhan" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "lop_nhan_id" UUID,
  ADD COLUMN IF NOT EXISTS "khoa_nhan" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "hoat_dong_nhan_id" UUID,
  ADD COLUMN IF NOT EXISTS "so_nguoi_duoc_chon" INTEGER,
  ADD COLUMN IF NOT EXISTS "so_nguoi_da_gui" INTEGER;

CREATE TABLE IF NOT EXISTS "phien_dang_nhap" (
  "id" UUID NOT NULL,
  "nguoi_dung_id" UUID NOT NULL,
  "ma_tab" VARCHAR(255) NOT NULL,
  "vai_tro" VARCHAR(50),
  "thoi_gian_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lan_hoat_dong" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "phien_dang_nhap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "du_lieu_khuon_mat" (
  "id" UUID NOT NULL,
  "sinh_vien_id" UUID NOT NULL,
  "vector_dac_trung" DOUBLE PRECISION[],
  "anh_khuon_mat" TEXT,
  "anh_khuon_mat_ds" JSONB,
  "da_xac_minh" BOOLEAN NOT NULL DEFAULT false,
  "so_anh_dang_ky" INTEGER NOT NULL DEFAULT 1,
  "model_name" VARCHAR(50),
  "model_version" VARCHAR(30),
  "embedding_dim" INTEGER NOT NULL DEFAULT 512,
  "threshold_used" DOUBLE PRECISION,
  "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ngay_cap_nhat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "du_lieu_khuon_mat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "dong_y_sinh_trac_hoc" (
  "id" UUID NOT NULL,
  "sinh_vien_id" UUID NOT NULL,
  "consent_version" VARCHAR(20) NOT NULL,
  "accepted_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMP(6),
  "ip_address" VARCHAR(80),
  "user_agent" TEXT,
  CONSTRAINT "dong_y_sinh_trac_hoc_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "phien_diem_danh_qr" (
  "id" UUID NOT NULL,
  "hd_id" UUID NOT NULL,
  "nguoi_tao_id" UUID NOT NULL,
  "trang_thai" "TrangThaiPhienQr" NOT NULL DEFAULT 'dang_mo',
  "het_han_luc" TIMESTAMP(6) NOT NULL,
  "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ngay_cap_nhat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "phien_diem_danh_qr_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ma_diem_danh_qr" (
  "id" UUID NOT NULL,
  "phien_id" UUID NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "het_han_luc" TIMESTAMP(6) NOT NULL,
  "da_su_dung_luc" TIMESTAMP(6),
  "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ma_diem_danh_qr_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "yeu_cau_diem_danh_thu_cong" (
  "id" UUID NOT NULL,
  "sv_id" UUID NOT NULL,
  "hd_id" UUID NOT NULL,
  "nguoi_duyet_id" UUID,
  "ly_do" TEXT NOT NULL,
  "minh_chung" TEXT[],
  "gps_latitude" DECIMAL(10,7),
  "gps_longitude" DECIMAL(10,7),
  "gps_accuracy_m" DOUBLE PRECISION,
  "dia_chi_ip" INET,
  "user_agent" TEXT,
  "trang_thai" "TrangThaiYeuCauDiemDanh" NOT NULL DEFAULT 'cho_duyet',
  "ghi_chu_duyet" TEXT,
  "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ngay_duyet" TIMESTAMP(6),
  CONSTRAINT "yeu_cau_diem_danh_thu_cong_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "nhat_ky_diem_danh" (
  "id" UUID NOT NULL,
  "hanh_dong" VARCHAR(50) NOT NULL,
  "ket_qua" VARCHAR(20) NOT NULL,
  "nguoi_thuc_hien_id" UUID,
  "sinh_vien_id" UUID,
  "hoat_dong_id" UUID,
  "phien_qr_id" UUID,
  "ma_qr_id" UUID,
  "diem_danh_id" UUID,
  "ly_do" VARCHAR(100),
  "dia_chi_ip" INET,
  "user_agent" TEXT,
  "metadata" JSONB,
  "thoi_gian" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "nhat_ky_diem_danh_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "import_job" (
  "id" UUID NOT NULL,
  "type" "ImportType" NOT NULL,
  "filename" VARCHAR(255) NOT NULL,
  "status" "ImportStatus" NOT NULL DEFAULT 'pending',
  "total_rows" INTEGER NOT NULL DEFAULT 0,
  "valid_rows" INTEGER NOT NULL DEFAULT 0,
  "invalid_rows" INTEGER NOT NULL DEFAULT 0,
  "preview_payload" JSONB,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(6),
  CONSTRAINT "import_job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "import_job_error" (
  "id" UUID NOT NULL,
  "import_job_id" UUID NOT NULL,
  "row_number" INTEGER NOT NULL,
  "field" VARCHAR(100),
  "message" TEXT NOT NULL,
  "raw_value" TEXT,
  CONSTRAINT "import_job_error_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "phien_dang_nhap_ma_tab_key" ON "phien_dang_nhap"("ma_tab");
CREATE INDEX IF NOT EXISTS "phien_dang_nhap_nguoi_dung_id_idx" ON "phien_dang_nhap"("nguoi_dung_id");
CREATE INDEX IF NOT EXISTS "phien_dang_nhap_ma_tab_idx" ON "phien_dang_nhap"("ma_tab");
CREATE UNIQUE INDEX IF NOT EXISTS "du_lieu_khuon_mat_sinh_vien_id_key" ON "du_lieu_khuon_mat"("sinh_vien_id");
CREATE INDEX IF NOT EXISTS "dong_y_sinh_trac_hoc_sinh_vien_id_consent_version_idx" ON "dong_y_sinh_trac_hoc"("sinh_vien_id", "consent_version");
CREATE INDEX IF NOT EXISTS "hoat_dong_hoc_ky_nam_hoc_idx" ON "hoat_dong"("hoc_ky", "nam_hoc");
CREATE INDEX IF NOT EXISTS "hoat_dong_lop_id_hoc_ky_nam_hoc_idx" ON "hoat_dong"("lop_id", "hoc_ky", "nam_hoc");
CREATE INDEX IF NOT EXISTS "hoat_dong_nguoi_tao_id_hoc_ky_nam_hoc_idx" ON "hoat_dong"("nguoi_tao_id", "hoc_ky", "nam_hoc");
CREATE INDEX IF NOT EXISTS "hoat_dong_trang_thai_hoc_ky_nam_hoc_idx" ON "hoat_dong"("trang_thai", "hoc_ky", "nam_hoc");
CREATE INDEX IF NOT EXISTS "dang_ky_hoat_dong_sv_id_trang_thai_dk_idx" ON "dang_ky_hoat_dong"("sv_id", "trang_thai_dk");
CREATE INDEX IF NOT EXISTS "dang_ky_hoat_dong_hd_id_trang_thai_dk_idx" ON "dang_ky_hoat_dong"("hd_id", "trang_thai_dk");
CREATE INDEX IF NOT EXISTS "phien_diem_danh_qr_hd_id_trang_thai_idx" ON "phien_diem_danh_qr"("hd_id", "trang_thai");
CREATE INDEX IF NOT EXISTS "phien_diem_danh_qr_het_han_luc_idx" ON "phien_diem_danh_qr"("het_han_luc");
CREATE UNIQUE INDEX IF NOT EXISTS "ma_diem_danh_qr_token_hash_key" ON "ma_diem_danh_qr"("token_hash");
CREATE INDEX IF NOT EXISTS "ma_diem_danh_qr_phien_id_het_han_luc_idx" ON "ma_diem_danh_qr"("phien_id", "het_han_luc");
CREATE INDEX IF NOT EXISTS "yeu_cau_diem_danh_thu_cong_hd_id_trang_thai_idx" ON "yeu_cau_diem_danh_thu_cong"("hd_id", "trang_thai");
CREATE INDEX IF NOT EXISTS "yeu_cau_diem_danh_thu_cong_sv_id_trang_thai_idx" ON "yeu_cau_diem_danh_thu_cong"("sv_id", "trang_thai");
CREATE INDEX IF NOT EXISTS "yeu_cau_diem_danh_thu_cong_nguoi_duyet_id_idx" ON "yeu_cau_diem_danh_thu_cong"("nguoi_duyet_id");
CREATE UNIQUE INDEX IF NOT EXISTS "yeu_cau_diem_danh_thu_cong_sv_id_hd_id_key" ON "yeu_cau_diem_danh_thu_cong"("sv_id", "hd_id");
CREATE INDEX IF NOT EXISTS "nhat_ky_diem_danh_thoi_gian_idx" ON "nhat_ky_diem_danh"("thoi_gian");
CREATE INDEX IF NOT EXISTS "nhat_ky_diem_danh_hanh_dong_ket_qua_thoi_gian_idx" ON "nhat_ky_diem_danh"("hanh_dong", "ket_qua", "thoi_gian");
CREATE INDEX IF NOT EXISTS "nhat_ky_diem_danh_nguoi_thuc_hien_id_thoi_gian_idx" ON "nhat_ky_diem_danh"("nguoi_thuc_hien_id", "thoi_gian");
CREATE INDEX IF NOT EXISTS "nhat_ky_diem_danh_sinh_vien_id_thoi_gian_idx" ON "nhat_ky_diem_danh"("sinh_vien_id", "thoi_gian");
CREATE INDEX IF NOT EXISTS "nhat_ky_diem_danh_hoat_dong_id_thoi_gian_idx" ON "nhat_ky_diem_danh"("hoat_dong_id", "thoi_gian");
CREATE INDEX IF NOT EXISTS "nhat_ky_diem_danh_dia_chi_ip_thoi_gian_idx" ON "nhat_ky_diem_danh"("dia_chi_ip", "thoi_gian");
CREATE INDEX IF NOT EXISTS "import_job_created_by_created_at_idx" ON "import_job"("created_by", "created_at");
CREATE INDEX IF NOT EXISTS "import_job_type_status_created_at_idx" ON "import_job"("type", "status", "created_at");
CREATE INDEX IF NOT EXISTS "import_job_error_import_job_id_row_number_idx" ON "import_job_error"("import_job_id", "row_number");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'phien_dang_nhap_nguoi_dung_id_fkey') THEN
    ALTER TABLE "phien_dang_nhap" ADD CONSTRAINT "phien_dang_nhap_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'du_lieu_khuon_mat_sinh_vien_id_fkey') THEN
    ALTER TABLE "du_lieu_khuon_mat" ADD CONSTRAINT "du_lieu_khuon_mat_sinh_vien_id_fkey" FOREIGN KEY ("sinh_vien_id") REFERENCES "sinh_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dong_y_sinh_trac_hoc_sinh_vien_id_fkey') THEN
    ALTER TABLE "dong_y_sinh_trac_hoc" ADD CONSTRAINT "dong_y_sinh_trac_hoc_sinh_vien_id_fkey" FOREIGN KEY ("sinh_vien_id") REFERENCES "sinh_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoat_dong_lop_id_fkey') THEN
    ALTER TABLE "hoat_dong" ADD CONSTRAINT "hoat_dong_lop_id_fkey" FOREIGN KEY ("lop_id") REFERENCES "lop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dang_ky_hoat_dong_nguoi_duyet_id_fkey') THEN
    ALTER TABLE "dang_ky_hoat_dong" ADD CONSTRAINT "dang_ky_hoat_dong_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'diem_danh_fallback_request_id_fkey') THEN
    ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_fallback_request_id_fkey" FOREIGN KEY ("fallback_request_id") REFERENCES "yeu_cau_diem_danh_thu_cong"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'phien_diem_danh_qr_hd_id_fkey') THEN
    ALTER TABLE "phien_diem_danh_qr" ADD CONSTRAINT "phien_diem_danh_qr_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'phien_diem_danh_qr_nguoi_tao_id_fkey') THEN
    ALTER TABLE "phien_diem_danh_qr" ADD CONSTRAINT "phien_diem_danh_qr_nguoi_tao_id_fkey" FOREIGN KEY ("nguoi_tao_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ma_diem_danh_qr_phien_id_fkey') THEN
    ALTER TABLE "ma_diem_danh_qr" ADD CONSTRAINT "ma_diem_danh_qr_phien_id_fkey" FOREIGN KEY ("phien_id") REFERENCES "phien_diem_danh_qr"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'yeu_cau_diem_danh_thu_cong_hd_id_fkey') THEN
    ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'yeu_cau_diem_danh_thu_cong_sv_id_fkey') THEN
    ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_sv_id_fkey" FOREIGN KEY ("sv_id") REFERENCES "sinh_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'yeu_cau_diem_danh_thu_cong_nguoi_duyet_id_fkey') THEN
    ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nhat_ky_diem_danh_nguoi_thuc_hien_id_fkey') THEN
    ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nhat_ky_diem_danh_sinh_vien_id_fkey') THEN
    ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_sinh_vien_id_fkey" FOREIGN KEY ("sinh_vien_id") REFERENCES "sinh_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nhat_ky_diem_danh_hoat_dong_id_fkey') THEN
    ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_hoat_dong_id_fkey" FOREIGN KEY ("hoat_dong_id") REFERENCES "hoat_dong"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nhat_ky_diem_danh_phien_qr_id_fkey') THEN
    ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_phien_qr_id_fkey" FOREIGN KEY ("phien_qr_id") REFERENCES "phien_diem_danh_qr"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nhat_ky_diem_danh_ma_qr_id_fkey') THEN
    ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_ma_qr_id_fkey" FOREIGN KEY ("ma_qr_id") REFERENCES "ma_diem_danh_qr"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nhat_ky_diem_danh_diem_danh_id_fkey') THEN
    ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_diem_danh_id_fkey" FOREIGN KEY ("diem_danh_id") REFERENCES "diem_danh"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'import_job_created_by_fkey') THEN
    ALTER TABLE "import_job" ADD CONSTRAINT "import_job_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'import_job_error_import_job_id_fkey') THEN
    ALTER TABLE "import_job_error" ADD CONSTRAINT "import_job_error_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
