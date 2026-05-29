-- P5B-023a: Reporting/read-model event consumer.
-- Non-destructive additive migration for tenant-scoped event-driven read models.

-- CreateTable
CREATE TABLE "ReadModelEntry" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "read_model_key" TEXT NOT NULL,
    "source_event_id" TEXT NOT NULL,
    "source_event_type" TEXT NOT NULL,
    "source_event_version" TEXT NOT NULL,
    "source_event_occurred_at" TIMESTAMP(3) NOT NULL,
    "source_event_cursor" TEXT NOT NULL,
    "subject_type" TEXT NOT NULL,
    "subject_id" TEXT,
    "payload" JSONB NOT NULL,
    "privacy_class" TEXT NOT NULL DEFAULT 'internal',
    "retention_class" TEXT NOT NULL DEFAULT 'standard',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadModelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadModelCursor" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "read_model_key" TEXT NOT NULL,
    "source_module" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "cursor_value" TEXT NOT NULL,
    "last_event_id" TEXT,
    "last_event_occurred_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadModelCursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadModelEntry_organization_id_read_model_key_source_ev_key" ON "ReadModelEntry"("organization_id", "read_model_key", "source_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReadModelEntry_organization_id_id_key" ON "ReadModelEntry"("organization_id", "id");

-- CreateIndex
CREATE INDEX "ReadModelEntry_organization_id_read_model_key_updated_idx" ON "ReadModelEntry"("organization_id", "read_model_key", "updated_at");

-- CreateIndex
CREATE INDEX "ReadModelEntry_organization_id_source_event_cursor_idx" ON "ReadModelEntry"("organization_id", "source_event_cursor");

-- CreateIndex
CREATE INDEX "ReadModelEntry_organization_id_source_event_type_sour_idx" ON "ReadModelEntry"("organization_id", "source_event_type", "source_event_occurred_at");

-- CreateIndex
CREATE INDEX "ReadModelEntry_organization_id_subject_type_subject_id_idx" ON "ReadModelEntry"("organization_id", "subject_type", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReadModelCursor_organization_id_read_model_key_source__key" ON "ReadModelCursor"("organization_id", "read_model_key", "source_module", "event_type");

-- CreateIndex
CREATE UNIQUE INDEX "ReadModelCursor_organization_id_id_key" ON "ReadModelCursor"("organization_id", "id");

-- CreateIndex
CREATE INDEX "ReadModelCursor_organization_id_read_model_key_update_idx" ON "ReadModelCursor"("organization_id", "read_model_key", "updated_at");

-- CreateIndex
CREATE INDEX "ReadModelCursor_organization_id_cursor_value_idx" ON "ReadModelCursor"("organization_id", "cursor_value");

-- AddForeignKey
ALTER TABLE "ReadModelEntry" ADD CONSTRAINT "ReadModelEntry_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadModelCursor" ADD CONSTRAINT "ReadModelCursor_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
