ALTER TABLE "du_lieu_khuon_mat" ADD COLUMN "anh_khuon_mat_ds" JSONB;
UPDATE "du_lieu_khuon_mat" SET "anh_khuon_mat_ds" = jsonb_build_array("anh_khuon_mat") WHERE "anh_khuon_mat" IS NOT NULL;
