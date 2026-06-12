import { createHash } from 'node:crypto';

export const PHASE_6C_CHECKIN_TIME_WINDOW_SEED_ID = "seed_6c_113_checkin_time_window" as const;
export const PHASE_6C_CHECKIN_TIME_WINDOW_COMPONENT_ID = "6C.09" as const;
export const CHECKIN_TIME_WINDOW_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.checkin_time_window.runtime_evaluated" as const;

type CheckinTimeWindowDecision = 'CHECKIN_ALLOWED' | 'CHECKIN_TOO_EARLY' | 'CHECKIN_TOO_LATE' | 'CHECKIN_REQUIRES_REVIEW';

export type CheckinTimeWindowInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_issue_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  attempted_checkin_at: string;
  window_start_at: string;
  window_end_at: string;
  timezone: string;
  signed_ticket_token_ref?: string;
  person_identity_ref?: string;
  access_audit_ref?: string;
  crm_event_ref?: string;
  control_metadata?: Record<string, unknown>;
  checkin_mark_requested?: boolean;
  time_override_requested?: boolean;
  ticket_mutation_requested?: boolean;
  audit_persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type CheckinTimeWindowRuntimeReceipt = {
  seed_id: typeof PHASE_6C_CHECKIN_TIME_WINDOW_SEED_ID;
  component_id: typeof PHASE_6C_CHECKIN_TIME_WINDOW_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CCheckinTimeWindow";
  event_name: typeof CHECKIN_TIME_WINDOW_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_issue_ref: string;
  source_record_ref: string;
  attempted_checkin_at: string;
  window_start_at: string;
  window_end_at: string;
  timezone: string;
  decision: CheckinTimeWindowDecision;
  milliseconds_until_open: number;
  milliseconds_after_close: number;
  dependency_trace: {
    service_manifest_contract: string;
    registration_context: '6C.08';
    signed_ticket_token_ref: string | null;
    person_identity_ref: string | null;
    access_audit_ref: string | null;
    crm_event_ref: string | null;
  };
  adl_refs: readonly string[];
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for checkin_time_window runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for checkin_time_window.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for checkin_time_window.');
  }
  return normalized;
}

function requireTimezone(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'timezone');
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: normalized }).format(new Date('2026-01-01T00:00:00.000Z'));
  } catch {
    throw new Error('timezone must be an IANA timezone for checkin_time_window.');
  }
  return normalized;
}

function assertForbiddenRequests(input: CheckinTimeWindowInput): readonly string[] {
  const rejections = [
    ['checkin_mark_requested', input.checkin_mark_requested, 'check-in marking is outside this time-window evaluator'],
    ['time_override_requested', input.time_override_requested, 'time override requires separate human-approved policy'],
    ['ticket_mutation_requested', input.ticket_mutation_requested, 'ticket mutation is outside this evaluator'],
    ['audit_persistence_requested', input.audit_persistence_requested, 'audit persistence is deferred to runtime wiring'],
    ['schema_mutation_requested', input.schema_mutation_requested, 'schema mutation is forbidden for this runtime FFET'],
    ['frontend_requested', input.frontend_requested, 'frontend creation is outside the exact FFET scope'],
  ] as const;
  for (const [field, requested, message] of rejections) {
    if (requested === true) {
      throw new Error(field + ': ' + message + '.');
    }
  }
  return rejections.map(([field, , message]) => field + ': ' + message);
}

function decide(attemptMs: number, startMs: number, endMs: number): CheckinTimeWindowDecision {
  if (endMs <= startMs) {
    return 'CHECKIN_REQUIRES_REVIEW';
  }
  if (attemptMs < startMs) {
    return 'CHECKIN_TOO_EARLY';
  }
  if (attemptMs > endMs) {
    return 'CHECKIN_TOO_LATE';
  }
  return 'CHECKIN_ALLOWED';
}

function digestRuntime(receiptWithoutDigest: Omit<CheckinTimeWindowRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateCheckinTimeWindow(input: CheckinTimeWindowInput): CheckinTimeWindowRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const attemptedAt = requireTimestamp(input.attempted_checkin_at, 'attempted_checkin_at');
  const windowStartAt = requireTimestamp(input.window_start_at, 'window_start_at');
  const windowEndAt = requireTimestamp(input.window_end_at, 'window_end_at');
  const attemptMs = Date.parse(attemptedAt);
  const startMs = Date.parse(windowStartAt);
  const endMs = Date.parse(windowEndAt);
  const decision = decide(attemptMs, startMs, endMs);
  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');

  const receiptWithoutDigest: Omit<CheckinTimeWindowRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_CHECKIN_TIME_WINDOW_SEED_ID,
    component_id: PHASE_6C_CHECKIN_TIME_WINDOW_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CCheckinTimeWindow",
    event_name: CHECKIN_TIME_WINDOW_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: serviceManifestContract,
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_issue_ref: requireNonEmpty(input.ticket_issue_ref, 'ticket_issue_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    attempted_checkin_at: attemptedAt,
    window_start_at: windowStartAt,
    window_end_at: windowEndAt,
    timezone: requireTimezone(input.timezone),
    decision,
    milliseconds_until_open: Math.max(0, startMs - attemptMs),
    milliseconds_after_close: Math.max(0, attemptMs - endMs),
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      registration_context: '6C.08',
      signed_ticket_token_ref: optionalRef(input.signed_ticket_token_ref, 'signed_ticket_token_ref'),
      person_identity_ref: optionalRef(input.person_identity_ref, 'person_identity_ref'),
      access_audit_ref: optionalRef(input.access_audit_ref, 'access_audit_ref'),
      crm_event_ref: optionalRef(input.crm_event_ref, 'crm_event_ref'),
    },
    adl_refs: ["ADL-024"],
    decision_refs: ["6C-EVENT-CHECK-003", "6C-ATT-018", "6C-EVENT-CHECK-014", "6C-GLOBAL-018"],
    forbidden_behavior_rejections: forbiddenBehaviorRejections,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
