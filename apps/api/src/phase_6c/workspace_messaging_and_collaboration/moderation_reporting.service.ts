import { createHash } from "crypto";

type ModerationReportCategory =
  | "HARASSMENT"
  | "SPAM"
  | "SENSITIVE_DATA"
  | "POLICY_VIOLATION"
  | "OTHER";
type ModerationReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type ModerationReportDecision =
  | "MODERATION_REPORT_ACCEPTED"
  | "MODERATION_REPORT_ESCALATED"
  | "MODERATION_REPORT_REQUIRES_REVIEW"
  | "MODERATION_REPORT_REJECTED";

type ModerationReportPolicy = {
  policy_ref: string;
  auto_escalate_severities: readonly ModerationReportSeverity[];
  require_reporter_evidence: boolean;
  allow_self_report: boolean;
  duplicate_window_minutes: number;
};

export type ModerationReportInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  report_ref: string;
  reported_message_ref: string;
  reporter_user_ref: string;
  reported_actor_user_ref: string;
  category: ModerationReportCategory;
  severity: ModerationReportSeverity;
  reason: string;
  evidence_refs: string[];
  reported_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  policy: ModerationReportPolicy;
  prior_report_refs?: string[];
  content_removal_requested?: boolean;
  account_action_requested?: boolean;
  notification_send_requested?: boolean;
  gatekeeper_bypass_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ModerationReportReceipt = {
  seed_id: "seed_6c_068_moderation_reporting";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.moderation_reporting.evaluated";
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  report_ref: string;
  reported_message_ref: string;
  decision: ModerationReportDecision;
  category: ModerationReportCategory;
  severity: ModerationReportSeverity;
  escalation_required: boolean;
  duplicate_risk: boolean;
  review_reasons: string[];
  rejection_reasons: string[];
  normalized_evidence_refs: string[];
  content_removal_performed: false;
  account_action_performed: false;
  notification_send_performed: false;
  gatekeeper_bypass_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  event_dispatch_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-014", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};

const SEED_ID = "seed_6c_068_moderation_reporting" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME = "phase_6c.workspace_messaging_and_collaboration.moderation_reporting.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-014", "6C-GLOBAL-018"] as const;
const CATEGORIES = new Set<ModerationReportCategory>([
  "HARASSMENT",
  "SPAM",
  "SENSITIVE_DATA",
  "POLICY_VIOLATION",
  "OTHER",
]);
const SEVERITIES = new Set<ModerationReportSeverity>(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export function evaluateModerationReporting(input: ModerationReportInput): ModerationReportReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const policy = normalizePolicy(input.policy);
  const evidenceRefs = dedupeStrings(input.evidence_refs);
  const priorReportRefs = dedupeStrings(input.prior_report_refs ?? []);
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];

  if (policy.require_reporter_evidence && evidenceRefs.length === 0) {
    reviewReasons.push("reporter_evidence_required");
  }
  if (!policy.allow_self_report && input.reporter_user_ref.trim() === input.reported_actor_user_ref.trim()) {
    rejectionReasons.push("self_report_not_allowed_by_policy");
  }
  if (input.reason.trim().length < 12) {
    reviewReasons.push("moderation_reason_too_short");
  }
  const duplicateRisk = priorReportRefs.length > 0 && policy.duplicate_window_minutes > 0;
  if (duplicateRisk) {
    reviewReasons.push("possible_duplicate_report_in_policy_window");
  }

  const escalationRequired = policy.auto_escalate_severities.includes(input.severity);
  const decision = decide(escalationRequired, reviewReasons, rejectionReasons);
  const evidenceArtifacts = [
    `${SEED_ID}:workspace:${input.workspace_ref.trim()}`,
    `${SEED_ID}:report:${input.report_ref.trim()}`,
    `${SEED_ID}:message:${input.reported_message_ref.trim()}`,
    `${SEED_ID}:policy:${policy.policy_ref}`,
    `${SEED_ID}:decision:${decision}`,
    ...evidenceRefs.map((ref) => `${SEED_ID}:evidence:${ref}`),
  ];
  const digestPayload = {
    organization_id: input.organization_id.trim(),
    workspace_ref: input.workspace_ref.trim(),
    report_ref: input.report_ref.trim(),
    reported_message_ref: input.reported_message_ref.trim(),
    category: input.category,
    severity: input.severity,
    decision,
    escalationRequired,
    duplicateRisk,
    evidenceRefs,
    reviewReasons: reviewReasons.sort(),
    rejectionReasons: rejectionReasons.sort(),
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    report_ref: input.report_ref.trim(),
    reported_message_ref: input.reported_message_ref.trim(),
    decision,
    category: input.category,
    severity: input.severity,
    escalation_required: escalationRequired,
    duplicate_risk: duplicateRisk,
    review_reasons: reviewReasons.sort(),
    rejection_reasons: rejectionReasons.sort(),
    normalized_evidence_refs: evidenceRefs,
    content_removal_performed: false,
    account_action_performed: false,
    notification_send_performed: false,
    gatekeeper_bypass_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    event_dispatch_performed: false,
    frontend_route_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function decide(
  escalationRequired: boolean,
  reviewReasons: string[],
  rejectionReasons: string[],
): ModerationReportDecision {
  if (rejectionReasons.length > 0) {
    return "MODERATION_REPORT_REJECTED";
  }
  if (escalationRequired) {
    return "MODERATION_REPORT_ESCALATED";
  }
  if (reviewReasons.length > 0) {
    return "MODERATION_REPORT_REQUIRES_REVIEW";
  }
  return "MODERATION_REPORT_ACCEPTED";
}

function validateInput(input: ModerationReportInput): void {
  const requiredFields: Array<keyof ModerationReportInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "report_ref",
    "reported_message_ref",
    "reporter_user_ref",
    "reported_actor_user_ref",
    "reason",
    "reported_at",
    "evaluated_by_user_id",
    "evaluated_at",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (!CATEGORIES.has(input.category)) {
    throw new Error("category is not supported");
  }
  if (!SEVERITIES.has(input.severity)) {
    throw new Error("severity is not supported");
  }
  if (Number.isNaN(Date.parse(input.reported_at))) {
    throw new Error("reported_at must be an ISO-compatible timestamp");
  }
  if (Number.isNaN(Date.parse(input.evaluated_at))) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  validateStringArray(input.evidence_refs, "evidence_refs");
  if (input.prior_report_refs !== undefined) {
    validateStringArray(input.prior_report_refs, "prior_report_refs");
  }
  validatePolicy(input.policy);
}

function validatePolicy(policy: ModerationReportPolicy): void {
  assertNonEmptyString(policy?.policy_ref, "policy.policy_ref");
  if (!Array.isArray(policy.auto_escalate_severities)) {
    throw new Error("policy.auto_escalate_severities must be an array");
  }
  for (const severity of policy.auto_escalate_severities) {
    if (!SEVERITIES.has(severity)) {
      throw new Error("policy.auto_escalate_severities contains an unsupported severity");
    }
  }
  if (typeof policy.require_reporter_evidence !== "boolean") {
    throw new Error("policy.require_reporter_evidence must be boolean");
  }
  if (typeof policy.allow_self_report !== "boolean") {
    throw new Error("policy.allow_self_report must be boolean");
  }
  if (!Number.isInteger(policy.duplicate_window_minutes) || policy.duplicate_window_minutes < 0) {
    throw new Error("policy.duplicate_window_minutes must be a non-negative integer");
  }
}

function normalizePolicy(policy: ModerationReportPolicy): ModerationReportPolicy {
  return {
    policy_ref: policy.policy_ref.trim(),
    auto_escalate_severities: dedupeSeverities(policy.auto_escalate_severities),
    require_reporter_evidence: policy.require_reporter_evidence,
    allow_self_report: policy.allow_self_report,
    duplicate_window_minutes: policy.duplicate_window_minutes,
  };
}

function assertNoForbiddenRuntimeRequest(input: ModerationReportInput): void {
  const forbidden: Array<[keyof ModerationReportInput, string]> = [
    ["content_removal_requested", "content removal is outside this FFET"],
    ["account_action_requested", "account action is outside this FFET"],
    ["notification_send_requested", "notification sending is outside this FFET"],
    ["gatekeeper_bypass_requested", "Gatekeeper bypass is forbidden"],
    ["schema_mutation_requested", "schema mutation is outside this FFET"],
    ["phase_6a_mutation_requested", "Phase 6A mutation is outside this FFET"],
    ["phase_6b_mutation_requested", "Phase 6B mutation is outside this FFET"],
    ["event_dispatch_requested", "event dispatch is outside this FFET"],
    ["frontend_route_requested", "frontend routing is outside this FFET"],
    ["ticket_flag_flip_requested", "ticket/execution flag mutation is forbidden"],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function validateStringArray(values: unknown, field: string): asserts values is string[] {
  if (!Array.isArray(values)) {
    throw new Error(`${field} must be an array`);
  }
  for (const value of values) {
    assertNonEmptyString(value, `${field}[]`);
  }
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function dedupeSeverities(values: readonly ModerationReportSeverity[]): ModerationReportSeverity[] {
  return [...new Set(values)].sort();
}

function digest(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
