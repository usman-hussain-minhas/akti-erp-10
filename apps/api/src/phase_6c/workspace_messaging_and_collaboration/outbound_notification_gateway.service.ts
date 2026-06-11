import { createHash } from "crypto";

type OutboundNotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP";
type OutboundNotificationType =
  | "THREAD_MENTION"
  | "DIRECT_MESSAGE"
  | "CHANNEL_ANNOUNCEMENT"
  | "TASK_HANDOFF"
  | "SYSTEM_ALERT";
type OutboundNotificationUrgency = "LOW" | "NORMAL" | "HIGH";
type GatewayOptOutStatus = "ALLOWED" | "OPTED_OUT" | "UNKNOWN";
type OutboundNotificationGatewayDecision =
  | "READY_FOR_GATEWAY"
  | "PARTIALLY_READY_FOR_GATEWAY"
  | "REQUIRES_GATEWAY_REVIEW"
  | "SUPPRESSED_BY_OPT_OUT";

type OutboundNotificationRecipient = {
  recipient_ref: string;
  person_ref?: string;
  user_ref?: string;
  channels: readonly OutboundNotificationChannel[];
  opt_out_status: GatewayOptOutStatus;
  gateway_policy_evidence_ref?: string;
  locale?: string;
  timezone?: string;
};

type OutboundNotificationMessage = {
  subject: string;
  body_preview: string;
  deep_link_ref: string;
};

export type OutboundNotificationGatewayInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  notification_ref: string;
  actor_user_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  notification_type: OutboundNotificationType;
  urgency: OutboundNotificationUrgency;
  message: OutboundNotificationMessage;
  recipients: OutboundNotificationRecipient[];
  send_requested?: boolean;
  provider_adapter_requested?: boolean;
  direct_delivery_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_override_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

type OutboundNotificationGatewayEnvelope = {
  envelope_ref: string;
  recipient_ref: string;
  person_ref?: string;
  user_ref?: string;
  channel: OutboundNotificationChannel;
  notification_type: OutboundNotificationType;
  urgency: OutboundNotificationUrgency;
  subject: string;
  body_preview: string;
  deep_link_ref: string;
  gateway_policy_evidence_ref: string;
  required_gateway_controls: readonly ["global_opt_out_registry", "outbound_gateway_enforcement"];
  adl_refs: readonly ["ADL-004"];
  send_performed: false;
};

type SuppressedNotificationRecipient = {
  recipient_ref: string;
  reason: "GLOBAL_OPT_OUT" | "MISSING_GATEWAY_POLICY_EVIDENCE" | "NO_CHANNELS";
  channels: readonly OutboundNotificationChannel[];
};

export type OutboundNotificationGatewayReceipt = {
  seed_id: "seed_6c_062_outbound_notification_gateway";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.outbound_notification_gateway.evaluated";
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  notification_ref: string;
  decision: OutboundNotificationGatewayDecision;
  recipient_count: number;
  envelope_count: number;
  suppressed_count: number;
  review_reasons: string[];
  gateway_envelopes: OutboundNotificationGatewayEnvelope[];
  suppressed_recipients: SuppressedNotificationRecipient[];
  send_performed: false;
  provider_adapter_performed: false;
  direct_delivery_performed: false;
  gateway_bypass_performed: false;
  opt_out_override_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-007", "6C-GLOBAL-013", "6C-ADL-008"];
  adl_refs: readonly ["ADL-004"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};

const SEED_ID = "seed_6c_062_outbound_notification_gateway" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME =
  "phase_6c.workspace_messaging_and_collaboration.outbound_notification_gateway.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-007", "6C-GLOBAL-013", "6C-ADL-008"] as const;
const ADL_REFS = ["ADL-004"] as const;
const REQUIRED_GATEWAY_CONTROLS = ["global_opt_out_registry", "outbound_gateway_enforcement"] as const;
const CHANNELS = new Set<OutboundNotificationChannel>(["EMAIL", "SMS", "PUSH", "IN_APP"]);
const NOTIFICATION_TYPES = new Set<OutboundNotificationType>([
  "THREAD_MENTION",
  "DIRECT_MESSAGE",
  "CHANNEL_ANNOUNCEMENT",
  "TASK_HANDOFF",
  "SYSTEM_ALERT",
]);
const URGENCIES = new Set<OutboundNotificationUrgency>(["LOW", "NORMAL", "HIGH"]);
const OPT_OUT_STATUSES = new Set<GatewayOptOutStatus>(["ALLOWED", "OPTED_OUT", "UNKNOWN"]);

export function evaluateOutboundNotificationGateway(
  input: OutboundNotificationGatewayInput,
): OutboundNotificationGatewayReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const gatewayEnvelopes: OutboundNotificationGatewayEnvelope[] = [];
  const suppressedRecipients: SuppressedNotificationRecipient[] = [];
  const reviewReasons: string[] = [];

  for (const recipient of input.recipients) {
    const normalizedRecipient = normalizeRecipient(recipient);
    if (normalizedRecipient.channels.length === 0) {
      suppressedRecipients.push({
        recipient_ref: normalizedRecipient.recipient_ref,
        reason: "NO_CHANNELS",
        channels: [],
      });
      reviewReasons.push(`${normalizedRecipient.recipient_ref}:no_channels`);
      continue;
    }
    if (normalizedRecipient.opt_out_status === "OPTED_OUT") {
      suppressedRecipients.push({
        recipient_ref: normalizedRecipient.recipient_ref,
        reason: "GLOBAL_OPT_OUT",
        channels: normalizedRecipient.channels,
      });
      continue;
    }
    if (normalizedRecipient.opt_out_status === "UNKNOWN" || !normalizedRecipient.gateway_policy_evidence_ref) {
      suppressedRecipients.push({
        recipient_ref: normalizedRecipient.recipient_ref,
        reason: "MISSING_GATEWAY_POLICY_EVIDENCE",
        channels: normalizedRecipient.channels,
      });
      reviewReasons.push(`${normalizedRecipient.recipient_ref}:missing_gateway_policy_evidence`);
      continue;
    }

    for (const channel of normalizedRecipient.channels) {
      gatewayEnvelopes.push({
        envelope_ref: envelopeRef(input.notification_ref, normalizedRecipient.recipient_ref, channel),
        recipient_ref: normalizedRecipient.recipient_ref,
        person_ref: normalizedRecipient.person_ref,
        user_ref: normalizedRecipient.user_ref,
        channel,
        notification_type: input.notification_type,
        urgency: input.urgency,
        subject: input.message.subject.trim(),
        body_preview: input.message.body_preview.trim(),
        deep_link_ref: input.message.deep_link_ref.trim(),
        gateway_policy_evidence_ref: normalizedRecipient.gateway_policy_evidence_ref,
        required_gateway_controls: REQUIRED_GATEWAY_CONTROLS,
        adl_refs: ADL_REFS,
        send_performed: false,
      });
    }
  }

  const decision = decide(gatewayEnvelopes.length, suppressedRecipients.length, reviewReasons.length);
  const evidenceArtifacts = [
    `${SEED_ID}:notification:${input.notification_ref.trim()}`,
    `${SEED_ID}:workspace:${input.workspace_ref.trim()}`,
    `${SEED_ID}:gateway_envelopes:${gatewayEnvelopes.length}`,
    `${SEED_ID}:suppressed:${suppressedRecipients.length}`,
    ...gatewayEnvelopes.map((envelope) => `${SEED_ID}:envelope:${envelope.envelope_ref}`),
  ];

  const digestPayload = {
    organization_id: input.organization_id.trim(),
    workspace_ref: input.workspace_ref.trim(),
    notification_ref: input.notification_ref.trim(),
    decision,
    gatewayEnvelopes,
    suppressedRecipients,
    reviewReasons,
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    notification_ref: input.notification_ref.trim(),
    decision,
    recipient_count: input.recipients.length,
    envelope_count: gatewayEnvelopes.length,
    suppressed_count: suppressedRecipients.length,
    review_reasons: reviewReasons.sort(),
    gateway_envelopes: gatewayEnvelopes.sort((a, b) => a.envelope_ref.localeCompare(b.envelope_ref)),
    suppressed_recipients: suppressedRecipients.sort((a, b) => a.recipient_ref.localeCompare(b.recipient_ref)),
    send_performed: false,
    provider_adapter_performed: false,
    direct_delivery_performed: false,
    gateway_bypass_performed: false,
    opt_out_override_performed: false,
    event_dispatch_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    frontend_route_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    adl_refs: ADL_REFS,
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function validateInput(input: OutboundNotificationGatewayInput): void {
  const requiredFields: Array<keyof OutboundNotificationGatewayInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "notification_ref",
    "actor_user_ref",
    "evaluated_by_user_id",
    "evaluated_at",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (Number.isNaN(Date.parse(input.evaluated_at))) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  if (!NOTIFICATION_TYPES.has(input.notification_type)) {
    throw new Error("notification_type is not supported");
  }
  if (!URGENCIES.has(input.urgency)) {
    throw new Error("urgency is not supported");
  }
  assertNonEmptyString(input.message?.subject, "message.subject");
  assertNonEmptyString(input.message?.body_preview, "message.body_preview");
  assertNonEmptyString(input.message?.deep_link_ref, "message.deep_link_ref");
  if (!Array.isArray(input.recipients) || input.recipients.length === 0) {
    throw new Error("recipients must contain at least one recipient");
  }
  input.recipients.forEach(validateRecipient);
}

function validateRecipient(recipient: OutboundNotificationRecipient, index: number): void {
  const label = `recipients[${index}]`;
  assertNonEmptyString(recipient.recipient_ref, `${label}.recipient_ref`);
  if (!Array.isArray(recipient.channels)) {
    throw new Error(`${label}.channels must be an array`);
  }
  for (const channel of recipient.channels) {
    if (!CHANNELS.has(channel)) {
      throw new Error(`${label}.channels contains an unsupported channel`);
    }
  }
  if (!OPT_OUT_STATUSES.has(recipient.opt_out_status)) {
    throw new Error(`${label}.opt_out_status is not supported`);
  }
  if (recipient.person_ref !== undefined) {
    assertNonEmptyString(recipient.person_ref, `${label}.person_ref`);
  }
  if (recipient.user_ref !== undefined) {
    assertNonEmptyString(recipient.user_ref, `${label}.user_ref`);
  }
  if (recipient.gateway_policy_evidence_ref !== undefined) {
    assertNonEmptyString(recipient.gateway_policy_evidence_ref, `${label}.gateway_policy_evidence_ref`);
  }
}

function normalizeRecipient(recipient: OutboundNotificationRecipient): OutboundNotificationRecipient {
  return {
    ...recipient,
    recipient_ref: recipient.recipient_ref.trim(),
    person_ref: recipient.person_ref?.trim(),
    user_ref: recipient.user_ref?.trim(),
    gateway_policy_evidence_ref: recipient.gateway_policy_evidence_ref?.trim(),
    channels: [...new Set(recipient.channels)].sort(),
  };
}

function decide(
  envelopeCount: number,
  suppressedCount: number,
  reviewReasonCount: number,
): OutboundNotificationGatewayDecision {
  if (envelopeCount === 0 && suppressedCount > 0 && reviewReasonCount === 0) {
    return "SUPPRESSED_BY_OPT_OUT";
  }
  if (envelopeCount === 0) {
    return "REQUIRES_GATEWAY_REVIEW";
  }
  if (suppressedCount > 0 || reviewReasonCount > 0) {
    return "PARTIALLY_READY_FOR_GATEWAY";
  }
  return "READY_FOR_GATEWAY";
}

function assertNoForbiddenRuntimeRequest(input: OutboundNotificationGatewayInput): void {
  const forbidden: Array<[keyof OutboundNotificationGatewayInput, string]> = [
    ["send_requested", "sending is outside this FFET; only gateway envelopes may be prepared"],
    ["provider_adapter_requested", "provider adapter execution is outside this FFET"],
    ["direct_delivery_requested", "direct delivery would bypass the gateway"],
    ["gateway_bypass_requested", "gateway bypass is forbidden by ADL-004"],
    ["opt_out_override_requested", "global opt-out override is forbidden by ADL-004"],
    ["event_dispatch_requested", "event dispatch is outside this FFET"],
    ["schema_mutation_requested", "schema mutation is outside this FFET"],
    ["phase_6a_mutation_requested", "Phase 6A mutation is outside this FFET"],
    ["phase_6b_mutation_requested", "Phase 6B mutation is outside this FFET"],
    ["frontend_route_requested", "frontend routing is outside this FFET"],
    ["ticket_flag_flip_requested", "ticket/execution flag mutation is forbidden"],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
}

function envelopeRef(notificationRef: string, recipientRef: string, channel: OutboundNotificationChannel): string {
  return `gateway_envelope_${digest({ notificationRef: notificationRef.trim(), recipientRef, channel }).slice(0, 24)}`;
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function digest(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
