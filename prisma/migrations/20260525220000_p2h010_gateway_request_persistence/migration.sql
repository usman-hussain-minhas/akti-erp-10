-- P2H-010: Engagement Gateway request traceability and persistence
CREATE TABLE "EngagementGatewayRequest" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "actor_user_id" TEXT NOT NULL,
  "source_module" TEXT NOT NULL,
  "capability_key" TEXT NOT NULL,
  "request_kind" TEXT NOT NULL,
  "recipient_ref" TEXT NOT NULL,
  "payload_json" JSONB NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "transport_channel" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "requested_at" TIMESTAMP(3) NOT NULL,
  "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EngagementGatewayRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EngagementGatewayRequest_organization_id_idempotency_key_key"
  ON "EngagementGatewayRequest"("organization_id", "idempotency_key");

CREATE INDEX "EngagementGatewayRequest_organization_id_recorded_at_idx"
  ON "EngagementGatewayRequest"("organization_id", "recorded_at");

CREATE INDEX "EngagementGatewayRequest_organization_id_actor_user_id_recorded_at_idx"
  ON "EngagementGatewayRequest"("organization_id", "actor_user_id", "recorded_at");

ALTER TABLE "EngagementGatewayRequest"
  ADD CONSTRAINT "EngagementGatewayRequest_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EngagementGatewayRequest"
  ADD CONSTRAINT "EngagementGatewayRequest_organization_id_actor_user_id_fkey"
  FOREIGN KEY ("organization_id", "actor_user_id") REFERENCES "User"("organization_id", "id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
