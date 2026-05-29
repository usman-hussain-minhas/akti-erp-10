-- P5B-020a: File/document metadata model.
-- Non-destructive additive migration for tenant-scoped file/document metadata.

-- CreateTable
CREATE TABLE "FileDocumentMetadata" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "owner_module" TEXT NOT NULL,
    "owner_entity_type" TEXT,
    "owner_entity_id" TEXT,
    "display_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "checksum_sha256" TEXT,
    "classification" TEXT NOT NULL,
    "retention_policy" TEXT NOT NULL,
    "access_policy" JSONB NOT NULL,
    "storage_provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "FileDocumentMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileDocumentMetadata_organization_id_file_key_key" ON "FileDocumentMetadata"("organization_id", "file_key");

-- CreateIndex
CREATE UNIQUE INDEX "FileDocumentMetadata_organization_id_storage_key_key" ON "FileDocumentMetadata"("organization_id", "storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "FileDocumentMetadata_organization_id_id_key" ON "FileDocumentMetadata"("organization_id", "id");

-- CreateIndex
CREATE INDEX "FileDocumentMetadata_organization_id_owner_module_creat_idx" ON "FileDocumentMetadata"("organization_id", "owner_module", "created_at");

-- CreateIndex
CREATE INDEX "FileDocumentMetadata_organization_id_owner_entity_type_o_idx" ON "FileDocumentMetadata"("organization_id", "owner_entity_type", "owner_entity_id");

-- CreateIndex
CREATE INDEX "FileDocumentMetadata_organization_id_classification_cre_idx" ON "FileDocumentMetadata"("organization_id", "classification", "created_at");

-- CreateIndex
CREATE INDEX "FileDocumentMetadata_organization_id_status_created_at_idx" ON "FileDocumentMetadata"("organization_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "FileDocumentMetadata_organization_id_created_by_user_id_cr_idx" ON "FileDocumentMetadata"("organization_id", "created_by_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "FileDocumentMetadata" ADD CONSTRAINT "FileDocumentMetadata_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileDocumentMetadata" ADD CONSTRAINT "FileDocumentMetadata_organization_id_created_by_user_id_fkey" FOREIGN KEY ("organization_id", "created_by_user_id") REFERENCES "User"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
