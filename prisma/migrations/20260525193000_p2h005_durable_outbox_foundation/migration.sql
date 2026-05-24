-- P2H-005: durable outbox foundation
ALTER TABLE "EventOutbox"
  ADD COLUMN "idempotency_key" TEXT,
  ADD COLUMN "attempt_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "next_attempt_at" TIMESTAMP(3),
  ADD COLUMN "last_error" TEXT,
  ADD COLUMN "dead_lettered_at" TIMESTAMP(3),
  ADD COLUMN "locked_at" TIMESTAMP(3),
  ADD COLUMN "locked_by" TEXT;

UPDATE "EventOutbox"
SET "idempotency_key" = 'legacy_' || "id"
WHERE "idempotency_key" IS NULL;

ALTER TABLE "EventOutbox"
  ALTER COLUMN "idempotency_key" SET NOT NULL;

CREATE UNIQUE INDEX "EventOutbox_organization_id_idempotency_key_key"
  ON "EventOutbox"("organization_id", "idempotency_key");

CREATE INDEX "EventOutbox_organization_id_status_next_attempt_at_created_at_idx"
  ON "EventOutbox"("organization_id", "status", "next_attempt_at", "created_at");

CREATE INDEX "EventOutbox_organization_id_dead_lettered_at_idx"
  ON "EventOutbox"("organization_id", "dead_lettered_at");
