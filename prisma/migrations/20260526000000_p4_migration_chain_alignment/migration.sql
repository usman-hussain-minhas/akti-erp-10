-- P4-009R: align additive migration chain output with current Prisma schema.
-- Non-destructive metadata alignment for fresh-database migration proof.

ALTER TABLE "LeadRecord" DROP CONSTRAINT "LeadRecord_organization_id_assigned_user_id_fkey";
ALTER TABLE "LeadRecord" DROP CONSTRAINT "LeadRecord_organization_id_organization_unit_id_fkey";

ALTER TABLE "LeadRecord"
  ADD CONSTRAINT "LeadRecord_organization_id_assigned_user_id_fkey"
  FOREIGN KEY ("organization_id", "assigned_user_id")
  REFERENCES "User"("organization_id", "id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "LeadRecord"
  ADD CONSTRAINT "LeadRecord_organization_id_organization_unit_id_fkey"
  FOREIGN KEY ("organization_id", "organization_unit_id")
  REFERENCES "OrganizationUnit"("organization_id", "id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER INDEX "EngagementGatewayRequest_organization_id_actor_user_id_recorded" RENAME TO "EngagementGatewayRequest_organization_id_actor_user_id_reco_idx";
ALTER INDEX "EventOutbox_organization_id_status_next_attempt_at_created_at_i" RENAME TO "EventOutbox_organization_id_status_next_attempt_at_created__idx";
ALTER INDEX "LeadRecord_organization_id_organization_unit_id_assigned_user_i" RENAME TO "LeadRecord_organization_id_organization_unit_id_assigned_us_idx";
ALTER INDEX "LeadRecord_organization_id_organization_unit_id_status_created_" RENAME TO "LeadRecord_organization_id_organization_unit_id_status_crea_idx";
