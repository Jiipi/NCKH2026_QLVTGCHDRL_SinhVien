-- Migration: remove extended student profile fields not present in tkht.md spec
-- Date: 2025-10-02
-- Fixed: Simplified to avoid transaction errors

-- Drop columns from sinh_vien if they exist (defensive IF EXISTS to avoid failure if partially applied)
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "avatar_url";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "dia_chi_gia_dinh";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "diem_thpt";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "email_phu";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "ky_nang";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "muc_tieu";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "mui_gio";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "nam_tot_nghiep_thpt";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "ngon_ngu";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "sdt_cha";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "sdt_khan_cap";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "sdt_me";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "so_thich";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "ten_cha";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "ten_me";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "thong_bao_email";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "thong_bao_sdt";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "truong_thpt";
ALTER TABLE "public"."sinh_vien" DROP COLUMN IF EXISTS "ngay_cap_nhat";

-- Drop unused enums if no table depends on them (use CASCADE to force, IF EXISTS to be safe)
DROP TYPE IF EXISTS "public"."TrangThaiAttendanceSession" CASCADE;
DROP TYPE IF EXISTS "public"."TrangThaiQRAttendance" CASCADE;