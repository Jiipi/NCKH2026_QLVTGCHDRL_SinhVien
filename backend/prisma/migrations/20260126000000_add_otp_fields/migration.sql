-- AlterTable
ALTER TABLE "nguoi_dung" 
ADD COLUMN IF NOT EXISTS "ma_xac_minh" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "tg_het_han_ma" TIMESTAMP(6);
