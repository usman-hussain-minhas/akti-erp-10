-- P2H-009: Lead Desk DB relation integrity and assignment history
ALTER TABLE "LeadRecord"
  ADD CONSTRAINT "LeadRecord_organization_id_assigned_user_id_fkey"
  FOREIGN KEY ("organization_id", "assigned_user_id")
  REFERENCES "User"("organization_id", "id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "LeadStatusHistory"
  ADD CONSTRAINT "LeadStatusHistory_organization_id_actor_user_id_fkey"
  FOREIGN KEY ("organization_id", "actor_user_id")
  REFERENCES "User"("organization_id", "id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "LeadAssignmentHistory"
  ADD CONSTRAINT "LeadAssignmentHistory_organization_id_actor_user_id_fkey"
  FOREIGN KEY ("organization_id", "actor_user_id")
  REFERENCES "User"("organization_id", "id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "LeadAssignmentHistory"
  ADD CONSTRAINT "LeadAssignmentHistory_organization_id_assigned_user_id_fkey"
  FOREIGN KEY ("organization_id", "assigned_user_id")
  REFERENCES "User"("organization_id", "id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
