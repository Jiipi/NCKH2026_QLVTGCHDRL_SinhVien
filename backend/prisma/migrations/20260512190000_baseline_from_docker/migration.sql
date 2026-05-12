-- CreateEnum
CREATE TYPE "GioiTinh" AS ENUM ('nam', 'nu', 'khac');

-- CreateEnum
CREATE TYPE "TrangThaiTaiKhoan" AS ENUM ('hoat_dong', 'khong_hoat_dong', 'khoa');

-- CreateEnum
CREATE TYPE "TrangThaiHoatDong" AS ENUM ('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy', 'ket_thuc');

-- CreateEnum
CREATE TYPE "TrangThaiDangKy" AS ENUM ('cho_duyet', 'da_duyet', 'tu_choi', 'da_tham_gia');

-- CreateEnum
CREATE TYPE "PhuongThucDiemDanh" AS ENUM ('qr', 'ma_vach', 'truyen_thong', 'khuon_mat', 'thu_cong_fallback');

-- CreateEnum
CREATE TYPE "KetQuaGeofence" AS ENUM ('trong_vung', 'ngoai_vung', 'khong_co_gps', 'khong_yeu_cau');

-- CreateEnum
CREATE TYPE "TrangThaiYeuCauDiemDanh" AS ENUM ('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy');

-- CreateEnum
CREATE TYPE "TrangThaiThamGia" AS ENUM ('co_mat', 'vang_mat', 'muon', 've_som');

-- CreateEnum
CREATE TYPE "TrangThaiPhienQr" AS ENUM ('dang_mo', 'da_dong', 'het_han');

-- CreateEnum
CREATE TYPE "MucDoUuTien" AS ENUM ('thap', 'trung_binh', 'cao', 'khan_cap');

-- CreateEnum
CREATE TYPE "TrangThaiGui" AS ENUM ('cho_gui', 'da_gui', 'that_bai');

-- CreateEnum
CREATE TYPE "PhuongThucGui" AS ENUM ('email', 'sdt', 'trong_he_thong');

-- CreateEnum
CREATE TYPE "HocKy" AS ENUM ('hoc_ky_1', 'hoc_ky_2');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('student', 'activity', 'class', 'registration', 'attendance');

-- CreateTable
CREATE TABLE "lop" (
    "id" UUID NOT NULL,
    "ten_lop" VARCHAR(30) NOT NULL,
    "khoa" VARCHAR(50) NOT NULL,
    "nien_khoa" VARCHAR(20) NOT NULL,
    "nam_nhap_hoc" DATE NOT NULL,
    "nam_tot_nghiep" DATE,
    "chu_nhiem" UUID NOT NULL,
    "lop_truong" UUID,

    CONSTRAINT "lop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vai_tro" (
    "id" UUID NOT NULL,
    "ten_vt" VARCHAR(50) NOT NULL,
    "mo_ta" TEXT,
    "quyen_han" JSONB,
    "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vai_tro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nguoi_dung" (
    "id" UUID NOT NULL,
    "ten_dn" VARCHAR(50) NOT NULL,
    "mat_khau" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "ho_ten" VARCHAR(50),
    "vai_tro_id" UUID NOT NULL,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'hoat_dong',
    "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lan_cuoi_dn" TIMESTAMP(6),
    "token_reset" VARCHAR(255),
    "tg_het_han_token" TIMESTAMP(6),
    "ma_xac_minh" VARCHAR(255),
    "tg_het_han_ma" TIMESTAMP(6),
    "anh_dai_dien" VARCHAR(255),

    CONSTRAINT "nguoi_dung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phien_dang_nhap" (
    "id" UUID NOT NULL,
    "nguoi_dung_id" UUID NOT NULL,
    "ma_tab" VARCHAR(255) NOT NULL,
    "vai_tro" VARCHAR(50),
    "thoi_gian_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lan_hoat_dong" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "phien_dang_nhap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinh_vien" (
    "id" UUID NOT NULL,
    "nguoi_dung_id" UUID NOT NULL,
    "mssv" VARCHAR(10) NOT NULL,
    "ngay_sinh" DATE NOT NULL,
    "gt" "GioiTinh",
    "lop_id" UUID NOT NULL,
    "dia_chi" TEXT,
    "sdt" VARCHAR(10),
    "email" VARCHAR(100),

    CONSTRAINT "sinh_vien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "du_lieu_khuon_mat" (
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

-- CreateTable
CREATE TABLE "dong_y_sinh_trac_hoc" (
    "id" UUID NOT NULL,
    "sinh_vien_id" UUID NOT NULL,
    "consent_version" VARCHAR(20) NOT NULL,
    "accepted_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(6),
    "ip_address" VARCHAR(80),
    "user_agent" TEXT,

    CONSTRAINT "dong_y_sinh_trac_hoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loai_hoat_dong" (
    "id" UUID NOT NULL,
    "ten_loai_hd" VARCHAR(50) NOT NULL,
    "mo_ta" TEXT,
    "diem_mac_dinh" DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    "diem_toi_da" DECIMAL(4,2) NOT NULL DEFAULT 10.00,
    "mau_sac" VARCHAR(7),
    "nguoi_tao_id" UUID,
    "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loai_hoat_dong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hoat_dong" (
    "id" UUID NOT NULL,
    "ma_hd" VARCHAR(50),
    "ten_hd" VARCHAR(200) NOT NULL,
    "mo_ta" TEXT,
    "loai_hd_id" UUID NOT NULL,
    "lop_id" UUID,
    "diem_rl" DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    "dia_diem" VARCHAR(200),
    "geo_latitude" DECIMAL(10,7),
    "geo_longitude" DECIMAL(10,7),
    "geo_radius_meters" INTEGER DEFAULT 100,
    "yeu_cau_gps" BOOLEAN NOT NULL DEFAULT false,
    "cho_phep_fallback" BOOLEAN NOT NULL DEFAULT true,
    "ngay_bd" TIMESTAMP(6) NOT NULL,
    "ngay_kt" TIMESTAMP(6) NOT NULL,
    "han_dk" TIMESTAMP(6),
    "sl_toi_da" INTEGER NOT NULL DEFAULT 1,
    "don_vi_to_chuc" TEXT,
    "yeu_cau_tham_gia" TEXT,
    "trang_thai" "TrangThaiHoatDong" NOT NULL DEFAULT 'cho_duyet',
    "ly_do_tu_choi" TEXT,
    "qr" VARCHAR(32),
    "hinh_anh" TEXT[],
    "tep_dinh_kem" TEXT[],
    "nguoi_tao_id" UUID NOT NULL,
    "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "co_chung_chi" BOOLEAN NOT NULL DEFAULT false,
    "hoc_ky" "HocKy" NOT NULL DEFAULT 'hoc_ky_1',
    "nam_hoc" VARCHAR(15),

    CONSTRAINT "hoat_dong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dang_ky_hoat_dong" (
    "id" UUID NOT NULL,
    "sv_id" UUID NOT NULL,
    "hd_id" UUID NOT NULL,
    "ngay_dang_ky" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trang_thai_dk" "TrangThaiDangKy" NOT NULL DEFAULT 'cho_duyet',
    "ly_do_dk" TEXT,
    "ly_do_tu_choi" TEXT,
    "ngay_duyet" TIMESTAMP(6),
    "nguoi_duyet_id" UUID,
    "ghi_chu" TEXT,

    CONSTRAINT "dang_ky_hoat_dong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diem_danh" (
    "id" UUID NOT NULL,
    "nguoi_diem_danh_id" UUID NOT NULL,
    "sv_id" UUID NOT NULL,
    "hd_id" UUID NOT NULL,
    "tg_diem_danh" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phuong_thuc" "PhuongThucDiemDanh" NOT NULL DEFAULT 'qr',
    "trang_thai_tham_gia" "TrangThaiThamGia" NOT NULL DEFAULT 'co_mat',
    "ghi_chu" TEXT,
    "dia_chi_ip" INET,
    "vi_tri_gps" TEXT,
    "gps_latitude" DECIMAL(10,7),
    "gps_longitude" DECIMAL(10,7),
    "gps_accuracy_m" DOUBLE PRECISION,
    "khoang_cach_m" DOUBLE PRECISION,
    "ket_qua_geofence" "KetQuaGeofence",
    "fallback_request_id" UUID,
    "xac_nhan_tham_gia" BOOLEAN NOT NULL DEFAULT true,
    "do_tin_cay_nhan_dien" DOUBLE PRECISION,

    CONSTRAINT "diem_danh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phien_diem_danh_qr" (
    "id" UUID NOT NULL,
    "hd_id" UUID NOT NULL,
    "nguoi_tao_id" UUID NOT NULL,
    "trang_thai" "TrangThaiPhienQr" NOT NULL DEFAULT 'dang_mo',
    "het_han_luc" TIMESTAMP(6) NOT NULL,
    "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phien_diem_danh_qr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ma_diem_danh_qr" (
    "id" UUID NOT NULL,
    "phien_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "het_han_luc" TIMESTAMP(6) NOT NULL,
    "da_su_dung_luc" TIMESTAMP(6),
    "ngay_tao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ma_diem_danh_qr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yeu_cau_diem_danh_thu_cong" (
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

-- CreateTable
CREATE TABLE "nhat_ky_diem_danh" (
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

-- CreateTable
CREATE TABLE "import_job" (
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

-- CreateTable
CREATE TABLE "import_job_error" (
    "id" UUID NOT NULL,
    "import_job_id" UUID NOT NULL,
    "row_number" INTEGER NOT NULL,
    "field" VARCHAR(100),
    "message" TEXT NOT NULL,
    "raw_value" TEXT,

    CONSTRAINT "import_job_error_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhat_ky_toan_ven_du_lieu" (
    "id" UUID NOT NULL,
    "chain_scope" VARCHAR(80) NOT NULL DEFAULT 'global',
    "sequence" INTEGER NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" VARCHAR(120),
    "action" VARCHAR(120) NOT NULL,
    "actor_id" UUID,
    "request_id" VARCHAR(120),
    "ip_address" VARCHAR(80),
    "user_agent" TEXT,
    "payload" JSONB NOT NULL,
    "payload_hash" CHAR(64) NOT NULL,
    "previous_hash" CHAR(64),
    "record_hash" CHAR(64) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhat_ky_toan_ven_du_lieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loai_thong_bao" (
    "id" UUID NOT NULL,
    "ten_loai_tb" VARCHAR(50) NOT NULL,
    "mo_ta" TEXT,

    CONSTRAINT "loai_thong_bao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thong_bao" (
    "id" UUID NOT NULL,
    "tieu_de" VARCHAR(200) NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "pham_vi_gui" VARCHAR(30),
    "vai_tro_nhan" VARCHAR(50),
    "lop_nhan_id" UUID,
    "khoa_nhan" VARCHAR(100),
    "hoat_dong_nhan_id" UUID,
    "so_nguoi_duoc_chon" INTEGER,
    "so_nguoi_da_gui" INTEGER,
    "loai_tb_id" UUID NOT NULL,
    "nguoi_gui_id" UUID NOT NULL,
    "nguoi_nhan_id" UUID NOT NULL,
    "da_doc" BOOLEAN NOT NULL DEFAULT false,
    "muc_do_uu_tien" "MucDoUuTien" NOT NULL DEFAULT 'trung_binh',
    "ngay_gui" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_doc" TIMESTAMP(6),
    "trang_thai_gui" "TrangThaiGui",
    "phuong_thuc_gui" "PhuongThucGui" NOT NULL DEFAULT 'email',

    CONSTRAINT "thong_bao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lop_ten_lop_key" ON "lop"("ten_lop");

-- CreateIndex
CREATE INDEX "lop_chu_nhiem_idx" ON "lop"("chu_nhiem");

-- CreateIndex
CREATE UNIQUE INDEX "vai_tro_ten_vt_key" ON "vai_tro"("ten_vt");

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_dung_ten_dn_key" ON "nguoi_dung"("ten_dn");

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_dung_email_key" ON "nguoi_dung"("email");

-- CreateIndex
CREATE UNIQUE INDEX "phien_dang_nhap_ma_tab_key" ON "phien_dang_nhap"("ma_tab");

-- CreateIndex
CREATE INDEX "phien_dang_nhap_nguoi_dung_id_idx" ON "phien_dang_nhap"("nguoi_dung_id");

-- CreateIndex
CREATE INDEX "phien_dang_nhap_ma_tab_idx" ON "phien_dang_nhap"("ma_tab");

-- CreateIndex
CREATE UNIQUE INDEX "sinh_vien_nguoi_dung_id_key" ON "sinh_vien"("nguoi_dung_id");

-- CreateIndex
CREATE UNIQUE INDEX "sinh_vien_mssv_key" ON "sinh_vien"("mssv");

-- CreateIndex
CREATE INDEX "sinh_vien_lop_id_idx" ON "sinh_vien"("lop_id");

-- CreateIndex
CREATE UNIQUE INDEX "du_lieu_khuon_mat_sinh_vien_id_key" ON "du_lieu_khuon_mat"("sinh_vien_id");

-- CreateIndex
CREATE INDEX "dong_y_sinh_trac_hoc_sinh_vien_id_consent_version_idx" ON "dong_y_sinh_trac_hoc"("sinh_vien_id", "consent_version");

-- CreateIndex
CREATE UNIQUE INDEX "loai_hoat_dong_ten_loai_hd_key" ON "loai_hoat_dong"("ten_loai_hd");

-- CreateIndex
CREATE UNIQUE INDEX "hoat_dong_ma_hd_key" ON "hoat_dong"("ma_hd");

-- CreateIndex
CREATE UNIQUE INDEX "hoat_dong_qr_key" ON "hoat_dong"("qr");

-- CreateIndex
CREATE INDEX "hoat_dong_hoc_ky_nam_hoc_idx" ON "hoat_dong"("hoc_ky", "nam_hoc");

-- CreateIndex
CREATE INDEX "hoat_dong_lop_id_hoc_ky_nam_hoc_idx" ON "hoat_dong"("lop_id", "hoc_ky", "nam_hoc");

-- CreateIndex
CREATE INDEX "hoat_dong_nguoi_tao_id_hoc_ky_nam_hoc_idx" ON "hoat_dong"("nguoi_tao_id", "hoc_ky", "nam_hoc");

-- CreateIndex
CREATE INDEX "hoat_dong_trang_thai_hoc_ky_nam_hoc_idx" ON "hoat_dong"("trang_thai", "hoc_ky", "nam_hoc");

-- CreateIndex
CREATE INDEX "dang_ky_hoat_dong_sv_id_trang_thai_dk_idx" ON "dang_ky_hoat_dong"("sv_id", "trang_thai_dk");

-- CreateIndex
CREATE INDEX "dang_ky_hoat_dong_hd_id_trang_thai_dk_idx" ON "dang_ky_hoat_dong"("hd_id", "trang_thai_dk");

-- CreateIndex
CREATE UNIQUE INDEX "dang_ky_hoat_dong_sv_id_hd_id_key" ON "dang_ky_hoat_dong"("sv_id", "hd_id");

-- CreateIndex
CREATE UNIQUE INDEX "diem_danh_sv_id_hd_id_key" ON "diem_danh"("sv_id", "hd_id");

-- CreateIndex
CREATE INDEX "phien_diem_danh_qr_hd_id_trang_thai_idx" ON "phien_diem_danh_qr"("hd_id", "trang_thai");

-- CreateIndex
CREATE INDEX "phien_diem_danh_qr_het_han_luc_idx" ON "phien_diem_danh_qr"("het_han_luc");

-- CreateIndex
CREATE UNIQUE INDEX "ma_diem_danh_qr_token_hash_key" ON "ma_diem_danh_qr"("token_hash");

-- CreateIndex
CREATE INDEX "ma_diem_danh_qr_phien_id_het_han_luc_idx" ON "ma_diem_danh_qr"("phien_id", "het_han_luc");

-- CreateIndex
CREATE INDEX "yeu_cau_diem_danh_thu_cong_hd_id_trang_thai_idx" ON "yeu_cau_diem_danh_thu_cong"("hd_id", "trang_thai");

-- CreateIndex
CREATE INDEX "yeu_cau_diem_danh_thu_cong_sv_id_trang_thai_idx" ON "yeu_cau_diem_danh_thu_cong"("sv_id", "trang_thai");

-- CreateIndex
CREATE INDEX "yeu_cau_diem_danh_thu_cong_nguoi_duyet_id_idx" ON "yeu_cau_diem_danh_thu_cong"("nguoi_duyet_id");

-- CreateIndex
CREATE UNIQUE INDEX "yeu_cau_diem_danh_thu_cong_sv_id_hd_id_key" ON "yeu_cau_diem_danh_thu_cong"("sv_id", "hd_id");

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

-- CreateIndex
CREATE INDEX "import_job_created_by_created_at_idx" ON "import_job"("created_by", "created_at");

-- CreateIndex
CREATE INDEX "import_job_type_status_created_at_idx" ON "import_job"("type", "status", "created_at");

-- CreateIndex
CREATE INDEX "import_job_error_import_job_id_row_number_idx" ON "import_job_error"("import_job_id", "row_number");

-- CreateIndex
CREATE UNIQUE INDEX "nhat_ky_toan_ven_du_lieu_record_hash_key" ON "nhat_ky_toan_ven_du_lieu"("record_hash");

-- CreateIndex
CREATE INDEX "nhat_ky_toan_ven_du_lieu_entity_type_entity_id_idx" ON "nhat_ky_toan_ven_du_lieu"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "nhat_ky_toan_ven_du_lieu_chain_scope_created_at_idx" ON "nhat_ky_toan_ven_du_lieu"("chain_scope", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "nhat_ky_toan_ven_du_lieu_chain_scope_sequence_key" ON "nhat_ky_toan_ven_du_lieu"("chain_scope", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "loai_thong_bao_ten_loai_tb_key" ON "loai_thong_bao"("ten_loai_tb");

-- AddForeignKey
ALTER TABLE "lop" ADD CONSTRAINT "lop_chu_nhiem_fkey" FOREIGN KEY ("chu_nhiem") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lop" ADD CONSTRAINT "lop_lop_truong_fkey" FOREIGN KEY ("lop_truong") REFERENCES "sinh_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguoi_dung" ADD CONSTRAINT "nguoi_dung_vai_tro_id_fkey" FOREIGN KEY ("vai_tro_id") REFERENCES "vai_tro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phien_dang_nhap" ADD CONSTRAINT "phien_dang_nhap_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinh_vien" ADD CONSTRAINT "sinh_vien_lop_id_fkey" FOREIGN KEY ("lop_id") REFERENCES "lop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinh_vien" ADD CONSTRAINT "sinh_vien_nguoi_dung_id_fkey" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "du_lieu_khuon_mat" ADD CONSTRAINT "du_lieu_khuon_mat_sinh_vien_id_fkey" FOREIGN KEY ("sinh_vien_id") REFERENCES "sinh_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dong_y_sinh_trac_hoc" ADD CONSTRAINT "dong_y_sinh_trac_hoc_sinh_vien_id_fkey" FOREIGN KEY ("sinh_vien_id") REFERENCES "sinh_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoat_dong" ADD CONSTRAINT "hoat_dong_loai_hd_id_fkey" FOREIGN KEY ("loai_hd_id") REFERENCES "loai_hoat_dong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoat_dong" ADD CONSTRAINT "hoat_dong_nguoi_tao_id_fkey" FOREIGN KEY ("nguoi_tao_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoat_dong" ADD CONSTRAINT "hoat_dong_lop_id_fkey" FOREIGN KEY ("lop_id") REFERENCES "lop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dang_ky_hoat_dong" ADD CONSTRAINT "dang_ky_hoat_dong_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dang_ky_hoat_dong" ADD CONSTRAINT "dang_ky_hoat_dong_sv_id_fkey" FOREIGN KEY ("sv_id") REFERENCES "sinh_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dang_ky_hoat_dong" ADD CONSTRAINT "dang_ky_hoat_dong_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_nguoi_diem_danh_id_fkey" FOREIGN KEY ("nguoi_diem_danh_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_sv_id_fkey" FOREIGN KEY ("sv_id") REFERENCES "sinh_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diem_danh" ADD CONSTRAINT "diem_danh_fallback_request_id_fkey" FOREIGN KEY ("fallback_request_id") REFERENCES "yeu_cau_diem_danh_thu_cong"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phien_diem_danh_qr" ADD CONSTRAINT "phien_diem_danh_qr_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phien_diem_danh_qr" ADD CONSTRAINT "phien_diem_danh_qr_nguoi_tao_id_fkey" FOREIGN KEY ("nguoi_tao_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ma_diem_danh_qr" ADD CONSTRAINT "ma_diem_danh_qr_phien_id_fkey" FOREIGN KEY ("phien_id") REFERENCES "phien_diem_danh_qr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_hd_id_fkey" FOREIGN KEY ("hd_id") REFERENCES "hoat_dong"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_sv_id_fkey" FOREIGN KEY ("sv_id") REFERENCES "sinh_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_diem_danh_thu_cong" ADD CONSTRAINT "yeu_cau_diem_danh_thu_cong_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "import_job" ADD CONSTRAINT "import_job_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_job_error" ADD CONSTRAINT "import_job_error_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thong_bao" ADD CONSTRAINT "thong_bao_loai_tb_id_fkey" FOREIGN KEY ("loai_tb_id") REFERENCES "loai_thong_bao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thong_bao" ADD CONSTRAINT "thong_bao_nguoi_gui_id_fkey" FOREIGN KEY ("nguoi_gui_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thong_bao" ADD CONSTRAINT "thong_bao_nguoi_nhan_id_fkey" FOREIGN KEY ("nguoi_nhan_id") REFERENCES "nguoi_dung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

