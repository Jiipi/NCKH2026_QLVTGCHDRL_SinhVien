-- CreateTable
CREATE TABLE "nhat_ky_diem_danh" (
    "id" TEXT NOT NULL,
    "hanh_dong" VARCHAR(50) NOT NULL,
    "ket_qua" VARCHAR(20) NOT NULL,
    "nguoi_thuc_hien_id" TEXT,
    "sinh_vien_id" TEXT,
    "hoat_dong_id" TEXT,
    "phien_qr_id" TEXT,
    "ma_qr_id" TEXT,
    "diem_danh_id" TEXT,
    "ly_do" VARCHAR(100),
    "dia_chi_ip" INET,
    "user_agent" TEXT,
    "metadata" JSONB,
    "thoi_gian" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhat_ky_diem_danh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nhat_ky_diem_danh_thoi_gian_idx" ON "nhat_ky_diem_danh"("thoi_gian");

-- CreateIndex
CREATE INDEX "nhat_ky_diem_danh_hanh_dong_ket_qua_thoi_gian_idx" ON "nhat_ky_diem_danh"("hanh_dong", "ket_qua", "thoi_gian");

-- CreateIndex
CREATE INDEX "nhat_ky_diem_danh_nguoi_thuc_hien_id_thoi_gian_idx" ON "nhat_ky_diem_danh"("nguoi_thuc_hien_id", "thoi_gian");

-- CreateIndex
CREATE INDEX "nhat_ky_diem_danh_sinh_vien_id_thoi_gian_idx" ON "nhat_ky_diem_danh"("sinh_vien_id", "thoi_gian");

-- CreateIndex
CREATE INDEX "nhat_ky_diem_danh_hoat_dong_id_thoi_gian_idx" ON "nhat_ky_diem_danh"("hoat_dong_id", "thoi_gian");

-- CreateIndex
CREATE INDEX "nhat_ky_diem_danh_dia_chi_ip_thoi_gian_idx" ON "nhat_ky_diem_danh"("dia_chi_ip", "thoi_gian");

-- AddForeignKey
ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_sinh_vien_id_fkey" FOREIGN KEY ("sinh_vien_id") REFERENCES "sinh_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_hoat_dong_id_fkey" FOREIGN KEY ("hoat_dong_id") REFERENCES "hoat_dong"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_phien_qr_id_fkey" FOREIGN KEY ("phien_qr_id") REFERENCES "phien_diem_danh_qr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_ma_qr_id_fkey" FOREIGN KEY ("ma_qr_id") REFERENCES "ma_diem_danh_qr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_diem_danh" ADD CONSTRAINT "nhat_ky_diem_danh_diem_danh_id_fkey" FOREIGN KEY ("diem_danh_id") REFERENCES "diem_danh"("id") ON DELETE SET NULL ON UPDATE CASCADE;
