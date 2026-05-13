DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MucDichVanTay') THEN
    CREATE TYPE "MucDichVanTay" AS ENUM ('dang_ky', 'dang_nhap', 'diem_danh');
  END IF;
END $$;

ALTER TYPE "PhuongThucDiemDanh" ADD VALUE IF NOT EXISTS 'van_tay';

CREATE TABLE IF NOT EXISTS "khoa_van_tay" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "nguoi_dung_id" UUID NOT NULL,
  "credential_id" TEXT NOT NULL,
  "public_key" JSONB NOT NULL,
  "counter" INTEGER NOT NULL DEFAULT 0,
  "transports" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "ten_thiet_bi" VARCHAR(120),
  "da_kich_hoat" BOOLEAN NOT NULL DEFAULT true,
  "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ngay_cap_nhat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lan_su_dung_cuoi" TIMESTAMP(6),
  CONSTRAINT "khoa_van_tay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "thu_thach_van_tay" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "nguoi_dung_id" UUID,
  "challenge" VARCHAR(255) NOT NULL,
  "muc_dich" "MucDichVanTay" NOT NULL,
  "hoat_dong_id" UUID,
  "het_han_luc" TIMESTAMP(6) NOT NULL,
  "da_su_dung_luc" TIMESTAMP(6),
  "dia_chi_ip" VARCHAR(80),
  "user_agent" TEXT,
  "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "thu_thach_van_tay_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "diem_danh" ADD COLUMN IF NOT EXISTS "khoa_van_tay_id" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "khoa_van_tay_credential_id_key" ON "khoa_van_tay"("credential_id");
CREATE INDEX IF NOT EXISTS "khoa_van_tay_nguoi_dung_id_da_kich_hoat_idx" ON "khoa_van_tay"("nguoi_dung_id", "da_kich_hoat");
CREATE UNIQUE INDEX IF NOT EXISTS "thu_thach_van_tay_challenge_key" ON "thu_thach_van_tay"("challenge");
CREATE INDEX IF NOT EXISTS "thu_thach_van_tay_nguoi_dung_id_muc_dich_het_han_luc_idx" ON "thu_thach_van_tay"("nguoi_dung_id", "muc_dich", "het_han_luc");
CREATE INDEX IF NOT EXISTS "thu_thach_van_tay_hoat_dong_id_muc_dich_het_han_luc_idx" ON "thu_thach_van_tay"("hoat_dong_id", "muc_dich", "het_han_luc");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'khoa_van_tay_nguoi_dung_id_fkey') THEN
    ALTER TABLE "khoa_van_tay"
      ADD CONSTRAINT "khoa_van_tay_nguoi_dung_id_fkey"
      FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'thu_thach_van_tay_nguoi_dung_id_fkey') THEN
    ALTER TABLE "thu_thach_van_tay"
      ADD CONSTRAINT "thu_thach_van_tay_nguoi_dung_id_fkey"
      FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'thu_thach_van_tay_hoat_dong_id_fkey') THEN
    ALTER TABLE "thu_thach_van_tay"
      ADD CONSTRAINT "thu_thach_van_tay_hoat_dong_id_fkey"
      FOREIGN KEY ("hoat_dong_id") REFERENCES "hoat_dong"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'diem_danh_khoa_van_tay_id_fkey') THEN
    ALTER TABLE "diem_danh"
      ADD CONSTRAINT "diem_danh_khoa_van_tay_id_fkey"
      FOREIGN KEY ("khoa_van_tay_id") REFERENCES "khoa_van_tay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
