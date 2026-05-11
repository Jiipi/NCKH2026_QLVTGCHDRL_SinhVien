CREATE TABLE "nhat_ky_toan_ven_du_lieu" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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

CREATE UNIQUE INDEX "nhat_ky_toan_ven_du_lieu_chain_scope_sequence_key" ON "nhat_ky_toan_ven_du_lieu"("chain_scope", "sequence");
CREATE UNIQUE INDEX "nhat_ky_toan_ven_du_lieu_record_hash_key" ON "nhat_ky_toan_ven_du_lieu"("record_hash");
CREATE INDEX "nhat_ky_toan_ven_du_lieu_entity_type_entity_id_idx" ON "nhat_ky_toan_ven_du_lieu"("entity_type", "entity_id");
CREATE INDEX "nhat_ky_toan_ven_du_lieu_chain_scope_created_at_idx" ON "nhat_ky_toan_ven_du_lieu"("chain_scope", "created_at");
