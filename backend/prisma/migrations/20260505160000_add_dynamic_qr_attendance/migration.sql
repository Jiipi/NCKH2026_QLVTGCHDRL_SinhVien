-- CreateTable
CREATE TABLE "phien_diem_danh_qr" (
    "id" TEXT NOT NULL,
    "hd_id" TEXT NOT NULL,
    "nguoi_tao_id" TEXT NOT NULL,
    "trang_thai" TEXT NOT NULL DEFAULT 'dang_mo',
    "het_han_luc" TIMESTAMP(3) NOT NULL,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phien_diem_danh_qr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_diem_danh_qr" (
    "id" TEXT NOT NULL,
    "phien_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "het_han_luc" TIMESTAMP(3) NOT NULL,
    "da_su_dung_luc" TIMESTAMP(3),
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_diem_danh_qr_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phien_diem_danh_qr_hd_id_trang_thai_idx" ON "phien_diem_danh_qr"("hd_id", "trang_thai");

-- CreateIndex
CREATE INDEX "phien_diem_danh_qr_het_han_luc_idx" ON "phien_diem_danh_qr"("het_han_luc");

-- CreateIndex
CREATE UNIQUE INDEX "ma_diem_danh_qr_token_hash_key" ON "ma_diem_danh_qr"("token_hash");

-- CreateIndex
CREATE INDEX "ma_diem_danh_qr_phien_id_het_han_luc_idx" ON "ma_diem_danh_qr"("phien_id", "het_han_luc");

-- AddForeignKey
ALTER TABLE "phien_diem_danh_qr" ADD CONSTRAINT "phien_diem_danh_qr_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phien_diem_danh_qr" ADD CONSTRAINT "phien_diem_danh_qr_nguoi_tao_id_fkey" FOREIGN KEY ("nguoi_tao_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_diem_danh_qr" ADD CONSTRAINT "ma_diem_danh_qr_phien_id_fkey" FOREIGN KEY ("phien_id") REFERENCES "phien_diem_danh_qr"("id") ON DELETE CASCADE ON UPDATE CASCADE;
