-- P5B-018b: Workflow core persistence baseline.
-- Non-destructive additive migration for workflow definitions, workflow instances, and workflow step instances.

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "workflow_key" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "tenant_scope" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "definition_json" JSONB NOT NULL,
    "capability_requirements" JSONB NOT NULL,
    "emitted_events" JSONB NOT NULL,
    "audit_hooks" JSONB NOT NULL,
    "evidence_requirements" JSONB NOT NULL,
    "deprecation_policy" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowInstance" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "workflow_definition_id" TEXT NOT NULL,
    "workflow_key" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "current_state" TEXT NOT NULL,
    "subject_type" TEXT NOT NULL,
    "subject_id" TEXT,
    "actor_user_id" TEXT NOT NULL,
    "correlation_id" TEXT,
    "context" JSONB NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStepInstance" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "workflow_instance_id" TEXT NOT NULL,
    "step_key" TEXT NOT NULL,
    "state_key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "action_key" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "gatekeeper_request_id" TEXT,
    "gatekeeper_outcome" "GatekeeperDecisionOutcome",
    "evidence_ref" TEXT,
    "event_ref" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL,

    CONSTRAINT "WorkflowStepInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_organization_id_workflow_key_version_key" ON "WorkflowDefinition"("organization_id", "workflow_key", "version");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_organization_id_id_key" ON "WorkflowDefinition"("organization_id", "id");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_organization_id_workflow_key_status_idx" ON "WorkflowDefinition"("organization_id", "workflow_key", "status");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_organization_id_status_idx" ON "WorkflowDefinition"("organization_id", "status");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_owner_idx" ON "WorkflowDefinition"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowInstance_organization_id_id_key" ON "WorkflowInstance"("organization_id", "id");

-- CreateIndex
CREATE INDEX "WorkflowInstance_organization_id_workflow_key_status_idx" ON "WorkflowInstance"("organization_id", "workflow_key", "status");

-- CreateIndex
CREATE INDEX "WorkflowInstance_organization_id_actor_user_id_started_a_idx" ON "WorkflowInstance"("organization_id", "actor_user_id", "started_at");

-- CreateIndex
CREATE INDEX "WorkflowInstance_organization_id_subject_type_subject__idx" ON "WorkflowInstance"("organization_id", "subject_type", "subject_id");

-- CreateIndex
CREATE INDEX "WorkflowInstance_correlation_id_idx" ON "WorkflowInstance"("correlation_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStepInstance_organization_id_workflow_instance__key" ON "WorkflowStepInstance"("organization_id", "workflow_instance_id", "step_key");

-- CreateIndex
CREATE INDEX "WorkflowStepInstance_organization_id_workflow_instance__idx" ON "WorkflowStepInstance"("organization_id", "workflow_instance_id", "started_at");

-- CreateIndex
CREATE INDEX "WorkflowStepInstance_organization_id_action_key_started_at_idx" ON "WorkflowStepInstance"("organization_id", "action_key", "started_at");

-- CreateIndex
CREATE INDEX "WorkflowStepInstance_organization_id_gatekeeper_outco_idx" ON "WorkflowStepInstance"("organization_id", "gatekeeper_outcome", "started_at");

-- CreateIndex
CREATE INDEX "WorkflowStepInstance_event_ref_idx" ON "WorkflowStepInstance"("event_ref");

-- AddForeignKey
ALTER TABLE "WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_organization_id_workflow_definition_i_fkey" FOREIGN KEY ("organization_id", "workflow_definition_id") REFERENCES "WorkflowDefinition"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_organization_id_actor_user_id_fkey" FOREIGN KEY ("organization_id", "actor_user_id") REFERENCES "User"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStepInstance" ADD CONSTRAINT "WorkflowStepInstance_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStepInstance" ADD CONSTRAINT "WorkflowStepInstance_organization_id_workflow_instance_i_fkey" FOREIGN KEY ("organization_id", "workflow_instance_id") REFERENCES "WorkflowInstance"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStepInstance" ADD CONSTRAINT "WorkflowStepInstance_organization_id_actor_user_id_fkey" FOREIGN KEY ("organization_id", "actor_user_id") REFERENCES "User"("organization_id", "id") ON DELETE SET NULL ON UPDATE CASCADE;
