import { createHash } from "crypto";

type MentionNotificationType = "USER_MENTION" | "ROLE_MENTION" | "CHANNEL_MENTION" | "TEAM_MENTION";
type MentionNotificationEvidenceStatus =
  | "GATEWAY_ENVELOPE_PREPARED"
  | "SUPPRESSED_BY_OPT_OUT"
  | "REQUIRES_REVIEW";
type MentionNotificationEvidenceDecision =
  | "MENTION_EVIDENCE_COMPLETE"
  | "MENTION_EVIDENCE_PARTIAL"
  | "MENTION_EVIDENCE_REQUIRES_REVIEW";

type MentionNotificationEvidenceItem = {
  mention_ref: string;
  mention_type: MentionNotificationType;
  token: string;
  target_ref: string;
  recipient_ref: string;
  evidence_status: MentionNotificationEvidenceStatus;
  gateway_envelope_ref?: string;
  gateway_policy_evidence_ref?: string;
  suppression_reason?: "GLOBAL_OPT_OUT" | "MISSING_GATEWAY_POLICY_EVIDENCE" | "NO_CHANNELS";
  review_reason?: string;
};

export type MentionNotificationEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  conversation_ref: string;
  message_ref: string;
  notification_ref: string;
  actor_user_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  mentions: MentionNotificationEvidenceItem[];
  send_requested?: boolean;
  provider_adapter_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_override_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

type RecordedMentionNotificationEvidence = {
  mention_ref: string;
  mention_type: MentionNotificationType;
  token: string;
  target_ref: string;
  recipient_ref: string;
  evidence_status: MentionNotificationEvidenceStatus;
  gateway_envelope_ref?: string;
  gateway_policy_evidence_ref?: string;
  suppression_reason?: "GLOBAL_OPT_OUT" | "MISSING_GATEWAY_POLICY_EVIDENCE" | "NO_CHANNELS";
  review_reason?: string;
  evidence_ref: string;
};

export type MentionNotificationEvidenceReceipt = {
  seed_id: "seed_6c_063_mention_notification_evidence";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.mention_notification_evidence.recorded";
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  conversation_ref: string;
  message_ref: string;
  notification_ref: string;
  decision: MentionNotificationEvidenceDecision;
  mention_count: number;
  gateway_prepared_count: number;
  suppressed_count: number;
  review_count: number;
  records: RecordedMentionNotificationEvidence[];
  review_reasons: string[];
  send_performed: false;
  provider_adapter_performed: false;
  gateway_bypass_performed: false;
  opt_out_override_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-008", "6C-GLOBAL-013", "6C-ADL-008"];
  adl_refs: readonly ["ADL-004"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};

const SEED_ID = "seed_6c_063_mention_notification_evidence" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME =
  "phase_6c.workspace_messaging_and_collaboration.mention_notification_evidence.recorded" as const;
const DECISION_REFS = ["6C-WORK-MSG-008", "6C-GLOBAL-013", "6C-ADL-008"] as const;
const ADL_REFS = ["ADL-004"] as const;
const MENTION_TYPES = new Set<MentionNotificationType>([
  "USER_MENTION",
  "ROLE_MENTION",
  "CHANNEL_MENTION",
  "TEAM_MENTION",
]);
const EVIDENCE_STATUSES = new Set<MentionNotificationEvidenceStatus>([
  "GATEWAY_ENVELOPE_PREPARED",
  "SUPPRESSED_BY_OPT_OUT",
  "REQUIRES_REVIEW",
]);
const SUPPRESSION_REASONS = new Set(["GLOBAL_OPT_OUT", "MISSING_GATEWAY_POLICY_EVIDENCE", "NO_CHANNELS"]);

export function recordMentionNotificationEvidence(
  input: MentionNotificationEvidenceInput,
): MentionNotificationEvidenceReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const reviewReasons: string[] = [];
  const records = input.mentions.map((mention) => {
    const normalized = normalizeMention(mention);
    if (normalized.evidence_status === "GATEWAY_ENVELOPE_PREPARED") {
      assertNonEmptyString(normalized.gateway_envelope_ref, `${normalized.mention_ref}.gateway_envelope_ref`);
      assertNonEmptyString(normalized.gateway_policy_evidence_ref, `${normalized.mention_ref}.gateway_policy_evidence_ref`);
    }
    if (normalized.evidence_status === "SUPPRESSED_BY_OPT_OUT") {
      assertNonEmptyString(normalized.suppression_reason, `${normalized.mention_ref}.suppression_reason`);
      if (!SUPPRESSION_REASONS.has(normalized.suppression_reason)) {
        throw new Error(`${normalized.mention_ref}.suppression_reason is not supported`);
      }
    }
    if (normalized.evidence_status === "REQUIRES_REVIEW") {
      assertNonEmptyString(normalized.review_reason, `${normalized.mention_ref}.review_reason`);
      reviewReasons.push(`${normalized.mention_ref}:${normalized.review_reason}`);
    }

    return {
      ...normalized,
      evidence_ref: evidenceRef(input.notification_ref, normalized.mention_ref, normalized.recipient_ref),
    } satisfies RecordedMentionNotificationEvidence;
  });

  const gatewayPreparedCount = records.filter(
    (record) => record.evidence_status === "GATEWAY_ENVELOPE_PREPARED",
  ).length;
  const suppressedCount = records.filter((record) => record.evidence_status === "SUPPRESSED_BY_OPT_OUT").length;
  const reviewCount = records.filter((record) => record.evidence_status === "REQUIRES_REVIEW").length;
  const decision = decide(gatewayPreparedCount, suppressedCount, reviewCount);
  const sortedRecords = records.sort((a, b) => a.mention_ref.localeCompare(b.mention_ref));
  const sortedReviewReasons = reviewReasons.sort();
  const evidenceArtifacts = [
    `${SEED_ID}:notification:${input.notification_ref.trim()}`,
    `${SEED_ID}:message:${input.message_ref.trim()}`,
    `${SEED_ID}:mentions:${records.length}`,
    ...sortedRecords.map((record) => `${SEED_ID}:evidence:${record.evidence_ref}`),
  ];
  const digestPayload = {
    organization_id: input.organization_id.trim(),
    notification_ref: input.notification_ref.trim(),
    decision,
    records: sortedRecords,
    reviewReasons: sortedReviewReasons,
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    conversation_ref: input.conversation_ref.trim(),
    message_ref: input.message_ref.trim(),
    notification_ref: input.notification_ref.trim(),
    decision,
    mention_count: records.length,
    gateway_prepared_count: gatewayPreparedCount,
    suppressed_count: suppressedCount,
    review_count: reviewCount,
    records: sortedRecords,
    review_reasons: sortedReviewReasons,
    send_performed: false,
    provider_adapter_performed: false,
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

function validateInput(input: MentionNotificationEvidenceInput): void {
  const requiredFields: Array<keyof MentionNotificationEvidenceInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "conversation_ref",
    "message_ref",
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
  if (!Array.isArray(input.mentions) || input.mentions.length === 0) {
    throw new Error("mentions must contain at least one mention evidence item");
  }
  input.mentions.forEach(validateMention);
}

function validateMention(mention: MentionNotificationEvidenceItem, index: number): void {
  const label = `mentions[${index}]`;
  assertNonEmptyString(mention.mention_ref, `${label}.mention_ref`);
  assertNonEmptyString(mention.token, `${label}.token`);
  assertNonEmptyString(mention.target_ref, `${label}.target_ref`);
  assertNonEmptyString(mention.recipient_ref, `${label}.recipient_ref`);
  if (!MENTION_TYPES.has(mention.mention_type)) {
    throw new Error(`${label}.mention_type is not supported`);
  }
  if (!EVIDENCE_STATUSES.has(mention.evidence_status)) {
    throw new Error(`${label}.evidence_status is not supported`);
  }
}

function normalizeMention(mention: MentionNotificationEvidenceItem): MentionNotificationEvidenceItem {
  return {
    mention_ref: mention.mention_ref.trim(),
    mention_type: mention.mention_type,
    token: mention.token.trim(),
    target_ref: mention.target_ref.trim(),
    recipient_ref: mention.recipient_ref.trim(),
    evidence_status: mention.evidence_status,
    gateway_envelope_ref: mention.gateway_envelope_ref?.trim(),
    gateway_policy_evidence_ref: mention.gateway_policy_evidence_ref?.trim(),
    suppression_reason: mention.suppression_reason,
    review_reason: mention.review_reason?.trim(),
  };
}

function decide(
  gatewayPreparedCount: number,
  suppressedCount: number,
  reviewCount: number,
): MentionNotificationEvidenceDecision {
  if (reviewCount > 0 || gatewayPreparedCount === 0) {
    return "MENTION_EVIDENCE_REQUIRES_REVIEW";
  }
  if (suppressedCount > 0) {
    return "MENTION_EVIDENCE_PARTIAL";
  }
  return "MENTION_EVIDENCE_COMPLETE";
}

function assertNoForbiddenRuntimeRequest(input: MentionNotificationEvidenceInput): void {
  const forbidden: Array<[keyof MentionNotificationEvidenceInput, string]> = [
    ["send_requested", "sending is outside this FFET; only mention evidence may be recorded"],
    ["provider_adapter_requested", "provider adapter execution is outside this FFET"],
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

function evidenceRef(notificationRef: string, mentionRef: string, recipientRef: string): string {
  return `mention_evidence_${digest({ notificationRef: notificationRef.trim(), mentionRef, recipientRef }).slice(0, 24)}`;
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function digest(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
