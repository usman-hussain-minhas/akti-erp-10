import { createHash } from 'node:crypto';

export const PHASE_6C_SESSION_LEVEL_CHECKIN_SEED_ID = "seed_6c_115_session_level_checkin" as const;
export const PHASE_6C_SESSION_LEVEL_CHECKIN_COMPONENT_ID = "6C.09" as const;
export const SESSION_LEVEL_CHECKIN_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.session_level_checkin.runtime_evaluated" as const;

type SessionLevelCheckinDecision = 'SESSION_CHECKIN_ALLOWED' | 'ALREADY_CHECKED_IN' | 'SESSION_NOT_ELIGIBLE' | 'WINDOW_REJECTED' | 'SESSION_CHECKIN_REQUIRES_REVIEW';
type SessionEligibilityStatus = 'eligible' | 'not_registered' | 'capacity_blocked' | 'cancelled' | 'review';
type SessionWindowStatus = 'allowed' | 'too_early' | 'too_late' | 'review';

export type SessionLevelCheckinInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  session_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_issue_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  session_eligibility_status: SessionEligibilityStatus;
  time_window_status: SessionWindowStatus;
  prior_session_checkin_ref?: string;
  signed_ticket_token_ref?: string;
  kiosk_checkin_ref?: string;
  person_identity_ref?: string;
  access_audit_ref?: string;
  crm_event_ref?: string;
  control_metadata?: Record<string, unknown>;
  checkin_record_requested?: boolean;
  session_capacity_mutation_requested?: boolean;
  attendance_persistence_requested?: boolean;
  ticket_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type SessionLevelCheckinRuntimeReceipt = {
  seed_id: typeof PHASE_6C_SESSION_LEVEL_CHECKIN_SEED_ID;
  component_id: typeof PHASE_6C_SESSION_LEVEL_CHECKIN_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CSessionLevelCheckin";
  event_name: typeof SESSION_LEVEL_CHECKIN_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  session_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_issue_ref: string;
  source_record_ref: string;
  session_eligibility_status: SessionEligibilityStatus;
  time_window_status: SessionWindowStatus;
  decision: SessionLevelCheckinDecision;
  dependency_trace: {
    service_manifest_contract: string;
    registration_context: '6C.08';
    prior_session_checkin_ref: string | null;
    signed_ticket_token_ref: string | null;
    kiosk_checkin_ref: string | null;
    person_identity_ref: string | null;
    access_audit_ref: string | null;
    crm_event_ref: string | null;
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for session_level_checkin runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for session_level_checkin.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for session_level_checkin.');
  }
  return normalized;
}

function assertForbiddenRequests(input: SessionLevelCheckinInput): readonly string[] {
  const rejections = [
    ['checkin_record_requested', input.checkin_record_requested, 'check-in record creation is outside this evaluator'],
    ['session_capacity_mutation_requested', input.session_capacity_mutation_requested, 'session capacity mutation is outside this evaluator'],
    ['attendance_persistence_requested', input.attendance_persistence_requested, 'attendance persistence is deferred to runtime wiring'],
    ['ticket_mutation_requested', input.ticket_mutation_requested, 'ticket mutation is outside this evaluator'],
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

function decide(input: { eligibility: SessionEligibilityStatus; window: SessionWindowStatus; priorRef: string | null }): SessionLevelCheckinDecision {
  if (input.priorRef !== null) {
    return 'ALREADY_CHECKED_IN';
  }
  if (input.eligibility === 'review' || input.window === 'review') {
    return 'SESSION_CHECKIN_REQUIRES_REVIEW';
  }
  if (input.eligibility !== 'eligible') {
    return 'SESSION_NOT_ELIGIBLE';
  }
  if (input.window !== 'allowed') {
    return 'WINDOW_REJECTED';
  }
  return 'SESSION_CHECKIN_ALLOWED';
}

function digestRuntime(receiptWithoutDigest: Omit<SessionLevelCheckinRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateSessionLevelCheckin(input: SessionLevelCheckinInput): SessionLevelCheckinRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const priorSessionCheckinRef = optionalRef(input.prior_session_checkin_ref, 'prior_session_checkin_ref');
  const decision = decide({ eligibility: input.session_eligibility_status, window: input.time_window_status, priorRef: priorSessionCheckinRef });
  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');

  const receiptWithoutDigest: Omit<SessionLevelCheckinRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_SESSION_LEVEL_CHECKIN_SEED_ID,
    component_id: PHASE_6C_SESSION_LEVEL_CHECKIN_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CSessionLevelCheckin",
    event_name: SESSION_LEVEL_CHECKIN_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: serviceManifestContract,
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    session_ref: requireNonEmpty(input.session_ref, 'session_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_issue_ref: requireNonEmpty(input.ticket_issue_ref, 'ticket_issue_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    session_eligibility_status: input.session_eligibility_status,
    time_window_status: input.time_window_status,
    decision,
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      registration_context: '6C.08',
      prior_session_checkin_ref: priorSessionCheckinRef,
      signed_ticket_token_ref: optionalRef(input.signed_ticket_token_ref, 'signed_ticket_token_ref'),
      kiosk_checkin_ref: optionalRef(input.kiosk_checkin_ref, 'kiosk_checkin_ref'),
      person_identity_ref: optionalRef(input.person_identity_ref, 'person_identity_ref'),
      access_audit_ref: optionalRef(input.access_audit_ref, 'access_audit_ref'),
      crm_event_ref: optionalRef(input.crm_event_ref, 'crm_event_ref'),
    },
    decision_refs: ["6C-EVENT-CHECK-005", "6C-EVENT-CHECK-014", "6C-GLOBAL-018"],
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
