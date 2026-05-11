-- Add geofence configuration to activities
ALTER TABLE "hoat_dong"
  ADD COLUMN "geo_latitude" DECIMAL(10,7),
  ADD COLUMN "geo_longitude" DECIMAL(10,7),
  ADD COLUMN "geo_radius_meters" INTEGER DEFAULT 100,
  ADD COLUMN "yeu_cau_gps" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "cho_phep_fallback" BOOLEAN NOT NULL DEFAULT true;

-- Add attendance geofence result enums
CREATE TYPE "KetQuaGeofence" AS ENUM ('trong_vung', 'ngoai_vung', 'khong_co_gps', 'khong_yeu_cau');
CREATE TYPE "TrangThaiYeuCauDiemDanh" AS ENUM ('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy');

ALTER TYPE "PhuongThucDiemDanh" ADD VALUE IF NOT EXISTS 'thu_cong_fallback';

-- Add geofence metadata to attendance records
ALTER TABLE "diem_danh"
  ADD COLUMN "gps_latitude" DECIMAL(10,7),
  ADD COLUMN "gps_longitude" DECIMAL(10,7),
  ADD COLUMN "gps_accuracy_m" DOUBLE PRECISION,
  ADD COLUMN "khoang_cach_m" DOUBLE PRECISION,
  ADD COLUMN "ket_qua_geofence" "KetQuaGeofence",
  ADD COLUMN "fallback_request_id" UUID;

-- Student-initiated manual attendance fallback requests
CREATE TABLE "yeu_cau_diem_danh_thu_cong" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sv_id" UUID NOT NULL,
  "hd_id" UUID NOT NULL,
  "nguoi_duyet_id" UUID,
  "ly_do" TEXT NOT NULL,
  "minh_chung" TEXT[] NOT NULL,
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

CREATE UNIQUE INDEX "yeu_cau_diem_danh_thu_cong_sv_id_hd_id_key" ON "yeu_cau_diem_danh_thu_cong"("sv_id", "hd_id");
CREATE INDEX "yeu_cau_diem_danh_thu_cong_hd_id_trang_thai_idx" ON "yeu_cau_diem_danh_thu_cong"("hd_id", "trang_thai");
CREATE INDEX "yeu_cau_diem_danh_thu_cong_sv_id_trang_thai_idx" ON "yeu_cau_diem_danh_thu_cong"("sv_id", "trang_thai");
CREATE INDEX "yeu_cau_diem_danh_thu_cong_nguoi_duyet_id_idx" ON "yeu_cau_diem_danh_thu_cong"("nguoi_duyet_id");

ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_sv_id_fkey" FOREIGN KEY ("sv_id") REFERENCES "sinh_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_fallback_request_id_fkey" FOREIGN KEY ("fallback_request_id") REFERENCES "yeu_cau_diem_danh_thu_cong"("id") ON DELETE SET NULL ON UPDATE CASCADE;
