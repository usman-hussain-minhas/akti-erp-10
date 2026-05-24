import { z } from "zod";

import { ManifestKeySchema, ModuleKeySchema } from "./module-manifest.schema.js";

const NonEmptyStringSchema = z.string().min(1);
const TimestampSchema = z.string().datetime({ offset: true });
const PayloadSchema = z.record(z.string(), z.unknown());
export const EngagementGatewayWhatsappStubPayloadSchema = z
  .object({
    template_key: NonEmptyStringSchema,
    locale: NonEmptyStringSchema,
    message_variables: z.record(z.string(), NonEmptyStringSchema),
    dry_run_only: z.literal(true),
  })
  .strict();

export const EngagementGatewayRequestKindSchema = z.enum(["outbound_engagement"]);
export const EngagementGatewayTransportChannelSchema = z.enum([
  "generic_stub",
  "whatsapp_stub",
]);
export const EngagementGatewayPrioritySchema = z.enum(["normal", "urgent"]);
export const EngagementGatewayRequestStatusSchema = z.enum(["recorded"]);
export const EngagementGatewayHealthStatusSchema = z.enum([
  "healthy",
  "degraded",
  "disabled",
  "unknown",
]);

export const EngagementGatewayCreateRequestInputSchema = z
  .object({
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    source_module: ModuleKeySchema,
    capability_key: ManifestKeySchema,
    request_kind: EngagementGatewayRequestKindSchema,
    recipient_ref: NonEmptyStringSchema,
    payload: PayloadSchema,
    transport_channel: EngagementGatewayTransportChannelSchema.default("generic_stub"),
    idempotency_key: NonEmptyStringSchema,
    priority: EngagementGatewayPrioritySchema,
    requested_at: TimestampSchema,
  })
  .strict();

export const EngagementGatewayCreateRequestOutputSchema = z
  .object({
    gateway_request_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    status: EngagementGatewayRequestStatusSchema,
    idempotency_key: NonEmptyStringSchema,
    recorded_at: TimestampSchema,
  })
  .strict();

export const EngagementGatewayRequestRecordedEventSchema = z
  .object({
    gateway_request_id: NonEmptyStringSchema,
    organization_id: NonEmptyStringSchema,
    actor_user_id: NonEmptyStringSchema,
    source_module: ModuleKeySchema,
    capability_key: ManifestKeySchema,
    request_kind: EngagementGatewayRequestKindSchema,
    idempotency_key: NonEmptyStringSchema,
    recorded_at: TimestampSchema,
  })
  .strict();

export const EngagementGatewayHealthOutputSchema = z
  .object({
    module_key: z.literal("engagement.gateway"),
    status: EngagementGatewayHealthStatusSchema,
    checked_at: TimestampSchema,
    degraded_reason: NonEmptyStringSchema.nullable(),
  })
  .strict();

export type EngagementGatewayRequestKind = z.infer<typeof EngagementGatewayRequestKindSchema>;
export type EngagementGatewayTransportChannel = z.infer<
  typeof EngagementGatewayTransportChannelSchema
>;
export type EngagementGatewayPriority = z.infer<typeof EngagementGatewayPrioritySchema>;
export type EngagementGatewayRequestStatus = z.infer<typeof EngagementGatewayRequestStatusSchema>;
export type EngagementGatewayHealthStatus = z.infer<typeof EngagementGatewayHealthStatusSchema>;
export type EngagementGatewayCreateRequestInput = z.infer<
  typeof EngagementGatewayCreateRequestInputSchema
>;
export type EngagementGatewayCreateRequestOutput = z.infer<
  typeof EngagementGatewayCreateRequestOutputSchema
>;
export type EngagementGatewayRequestRecordedEvent = z.infer<
  typeof EngagementGatewayRequestRecordedEventSchema
>;
export type EngagementGatewayHealthOutput = z.infer<typeof EngagementGatewayHealthOutputSchema>;
export type EngagementGatewayWhatsappStubPayload = z.infer<
  typeof EngagementGatewayWhatsappStubPayloadSchema
>;

export function parseEngagementGatewayCreateRequestInput(
  input: unknown,
): EngagementGatewayCreateRequestInput {
  return EngagementGatewayCreateRequestInputSchema.parse(input);
}

export function safeParseEngagementGatewayCreateRequestInput(input: unknown) {
  return EngagementGatewayCreateRequestInputSchema.safeParse(input);
}

export function parseEngagementGatewayCreateRequestOutput(
  input: unknown,
): EngagementGatewayCreateRequestOutput {
  return EngagementGatewayCreateRequestOutputSchema.parse(input);
}

export function safeParseEngagementGatewayCreateRequestOutput(input: unknown) {
  return EngagementGatewayCreateRequestOutputSchema.safeParse(input);
}

export function parseEngagementGatewayRequestRecordedEvent(
  input: unknown,
): EngagementGatewayRequestRecordedEvent {
  return EngagementGatewayRequestRecordedEventSchema.parse(input);
}

export function safeParseEngagementGatewayRequestRecordedEvent(input: unknown) {
  return EngagementGatewayRequestRecordedEventSchema.safeParse(input);
}

export function parseEngagementGatewayHealthOutput(input: unknown): EngagementGatewayHealthOutput {
  return EngagementGatewayHealthOutputSchema.parse(input);
}

export function safeParseEngagementGatewayHealthOutput(input: unknown) {
  return EngagementGatewayHealthOutputSchema.safeParse(input);
}

export const sampleEngagementGatewayCreateRequestInput =
  EngagementGatewayCreateRequestInputSchema.parse({
    organization_id: "organization_alpha",
    actor_user_id: "actor_alpha",
    source_module: "engagement.gateway",
    capability_key: "engagement.gateway.request.create",
    request_kind: "outbound_engagement",
    recipient_ref: "recipient_alpha",
    payload: {
      template_key: "engagement.gateway.sample",
      body_ref: "content_alpha",
    },
    transport_channel: "generic_stub",
    idempotency_key: "engagement_gateway_request_alpha",
    priority: "normal",
    requested_at: "2026-05-24T10:00:00.000Z",
  });

export const sampleEngagementGatewayWhatsappStubPayload =
  EngagementGatewayWhatsappStubPayloadSchema.parse({
    template_key: "lead.intake.ack",
    locale: "en-PK",
    message_variables: {
      lead_name: "Lead Alpha",
      organization_name: "Organization Alpha",
    },
    dry_run_only: true,
  });

export const sampleEngagementGatewayCreateRequestOutput =
  EngagementGatewayCreateRequestOutputSchema.parse({
    gateway_request_id: "gateway_request_alpha",
    organization_id: "organization_alpha",
    status: "recorded",
    idempotency_key: "engagement_gateway_request_alpha",
    recorded_at: "2026-05-24T10:00:01.000Z",
  });

export const sampleEngagementGatewayRequestRecordedEvent =
  EngagementGatewayRequestRecordedEventSchema.parse({
    gateway_request_id: "gateway_request_alpha",
    organization_id: "organization_alpha",
    actor_user_id: "actor_alpha",
    source_module: "engagement.gateway",
    capability_key: "engagement.gateway.request.create",
    request_kind: "outbound_engagement",
    idempotency_key: "engagement_gateway_request_alpha",
    recorded_at: "2026-05-24T10:00:01.000Z",
  });

export const sampleEngagementGatewayHealthOutput = EngagementGatewayHealthOutputSchema.parse({
  module_key: "engagement.gateway",
  status: "healthy",
  checked_at: "2026-05-24T10:00:00.000Z",
  degraded_reason: null,
});
