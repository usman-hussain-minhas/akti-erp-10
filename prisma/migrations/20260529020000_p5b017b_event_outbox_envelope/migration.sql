-- P5B-017b: EventOutbox Phase 5A event envelope columns.
-- Non-destructive additive migration; existing rows keep nullable/defaulted envelope fields.

ALTER TABLE "EventOutbox"
  ADD COLUMN "event_id" TEXT,
  ADD COLUMN "producer" TEXT NOT NULL DEFAULT 'akti-api',
  ADD COLUMN "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
  ADD COLUMN "source_module" TEXT NOT NULL DEFAULT 'platform',
  ADD COLUMN "subject" JSONB,
  ADD COLUMN "privacy_class" TEXT NOT NULL DEFAULT 'internal',
  ADD COLUMN "retention_class" TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN "redaction_policy" TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN "audit_required" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "replay_allowed" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "EventOutbox_event_id_idx"
  ON "EventOutbox"("event_id");

CREATE INDEX "EventOutbox_organization_id_event_type_created_at_idx"
  ON "EventOutbox"("organization_id", "event_type", "created_at");

CREATE INDEX "EventOutbox_organization_id_source_module_created_at_idx"
  ON "EventOutbox"("organization_id", "source_module", "created_at");

CREATE INDEX "EventOutbox_organization_id_schema_version_created_at_idx"
  ON "EventOutbox"("organization_id", "schema_version", "created_at");
