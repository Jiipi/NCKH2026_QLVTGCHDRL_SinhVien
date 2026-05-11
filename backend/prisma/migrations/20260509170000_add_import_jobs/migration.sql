-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('student', 'activity', 'class', 'registration', 'attendance');

-- CreateTable
CREATE TABLE "import_job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "import_job_id" UUID NOT NULL,
    "row_number" INTEGER NOT NULL,
    "field" VARCHAR(100),
    "message" TEXT NOT NULL,
    "raw_value" TEXT,

    CONSTRAINT "import_job_error_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_job_created_by_created_at_idx" ON "import_job"("created_by", "created_at");

-- CreateIndex
CREATE INDEX "import_job_type_status_created_at_idx" ON "import_job"("type", "status", "created_at");

-- CreateIndex
CREATE INDEX "import_job_error_import_job_id_row_number_idx" ON "import_job_error"("import_job_id", "row_number");

-- AddForeignKey
ALTER TABLE "import_job" ADD CONSTRAINT "import_job_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_job_error" ADD CONSTRAINT "import_job_error_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
