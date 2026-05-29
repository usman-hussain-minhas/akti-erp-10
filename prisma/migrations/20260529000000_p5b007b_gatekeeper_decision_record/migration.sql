-- P5B-007b: Gatekeeper decision persistence record.
-- Non-destructive additive migration for durable Gatekeeper outcome auditability.

-- CreateEnum
CREATE TYPE "GatekeeperDecisionOutcome" AS ENUM ('ALLOW', 'DENY', 'APPROVAL_REQUIRED', 'STOP_FOR_REVIEW');

-- CreateTable
CREATE TABLE "GatekeeperDecisionRecord" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "capability_key" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "scope_unit_id" TEXT,
    "action_key" TEXT NOT NULL,
    "outcome" "GatekeeperDecisionOutcome" NOT NULL,
    "reason_summary" JSONB NOT NULL,
    "check_results" JSONB NOT NULL,
    "required_evidence" JSONB NOT NULL,
    "missing_evidence" JSONB NOT NULL,
    "approval_chain_key" TEXT,
    "approval_request_id" TEXT,
    "decision_token" TEXT,
    "correlation_id" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "payload" JSONB NOT NULL,

    CONSTRAINT "GatekeeperDecisionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GatekeeperDecisionRecord_organization_id_outcome_recorded_a_idx" ON "GatekeeperDecisionRecord"("organization_id", "outcome", "recorded_at");

-- CreateIndex
CREATE INDEX "GatekeeperDecisionRecord_organization_id_actor_user_id_reco_idx" ON "GatekeeperDecisionRecord"("organization_id", "actor_user_id", "recorded_at");

-- CreateIndex
CREATE INDEX "GatekeeperDecisionRecord_organization_id_capability_key_rec_idx" ON "GatekeeperDecisionRecord"("organization_id", "capability_key", "recorded_at");

-- CreateIndex
CREATE INDEX "GatekeeperDecisionRecord_correlation_id_idx" ON "GatekeeperDecisionRecord"("correlation_id");

-- CreateIndex
CREATE UNIQUE INDEX "GatekeeperDecisionRecord_organization_id_request_id_key" ON "GatekeeperDecisionRecord"("organization_id", "request_id");

-- AddForeignKey
ALTER TABLE "GatekeeperDecisionRecord" ADD CONSTRAINT "GatekeeperDecisionRecord_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GatekeeperDecisionRecord" ADD CONSTRAINT "GatekeeperDecisionRecord_organization_id_actor_user_id_fkey" FOREIGN KEY ("organization_id", "actor_user_id") REFERENCES "User"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
