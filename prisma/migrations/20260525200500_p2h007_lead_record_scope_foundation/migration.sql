-- P2H-007: Lead Desk scope model and schema foundation
ALTER TABLE "LeadRecord"
  ADD COLUMN "organization_unit_id" TEXT;

CREATE INDEX "LeadRecord_organization_id_organization_unit_id_created_at_idx"
  ON "LeadRecord"("organization_id", "organization_unit_id", "created_at");

CREATE INDEX "LeadRecord_organization_id_organization_unit_id_status_created_at_idx"
  ON "LeadRecord"("organization_id", "organization_unit_id", "status", "created_at");

CREATE INDEX "LeadRecord_organization_id_organization_unit_id_assigned_user_id_created_at_idx"
  ON "LeadRecord"("organization_id", "organization_unit_id", "assigned_user_id", "created_at");

ALTER TABLE "LeadRecord"
  ADD CONSTRAINT "LeadRecord_organization_id_organization_unit_id_fkey"
  FOREIGN KEY ("organization_id", "organization_unit_id")
  REFERENCES "OrganizationUnit"("organization_id", "id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
