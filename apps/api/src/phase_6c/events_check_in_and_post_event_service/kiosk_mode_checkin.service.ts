import { createHash } from 'node:crypto';

export const PHASE_6C_KIOSK_MODE_CHECKIN_SEED_ID = "seed_6c_114_kiosk_mode_checkin" as const;
export const PHASE_6C_KIOSK_MODE_CHECKIN_COMPONENT_ID = "6C.09" as const;
export const KIOSK_MODE_CHECKIN_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.kiosk_mode_checkin.runtime_evaluated" as const;

type KioskModeCheckinDecision = 'KIOSK_CHECKIN_ALLOWED' | 'KIOSK_DISABLED' | 'TOKEN_REJECTED' | 'WINDOW_REJECTED' | 'KIOSK_REQUIRES_REVIEW';
type KioskTokenStatus = 'valid' | 'invalid' | 'expired' | 'missing';
type KioskWindowStatus = 'allowed' | 'too_early' | 'too_late' | 'review';

export type KioskModeCheckinInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  kiosk_session_ref: string;
  kiosk_device_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_issue_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  kiosk_mode_active: boolean;
  token_status: KioskTokenStatus;
  time_window_status: KioskWindowStatus;
  signed_ticket_token_ref?: string;
  checkin_time_window_ref?: string;
  person_identity_ref?: string;
  access_audit_ref?: string;
  crm_event_ref?: string;
  control_metadata?: Record<string, unknown>;
  checkin_mark_requested?: boolean;
  kiosk_ui_session_requested?: boolean;
  device_enrollment_requested?: boolean;
  token_override_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type KioskModeCheckinRuntimeReceipt = {
  seed_id: typeof PHASE_6C_KIOSK_MODE_CHECKIN_SEED_ID;
  component_id: typeof PHASE_6C_KIOSK_MODE_CHECKIN_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CKioskModeCheckin";
  event_name: typeof KIOSK_MODE_CHECKIN_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  kiosk_session_ref: string;
  kiosk_device_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_issue_ref: string;
  source_record_ref: string;
  kiosk_mode_active: boolean;
  token_status: KioskTokenStatus;
  time_window_status: KioskWindowStatus;
  decision: KioskModeCheckinDecision;
  dependency_trace: {
    service_manifest_contract: string;
    registration_context: '6C.08';
    signed_ticket_token_ref: string | null;
    checkin_time_window_ref: string | null;
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
    throw new Error(field + ' is required for kiosk_mode_checkin runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for kiosk_mode_checkin.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for kiosk_mode_checkin.');
  }
  return normalized;
}

function assertForbiddenRequests(input: KioskModeCheckinInput): readonly string[] {
  const rejections = [
    ['checkin_mark_requested', input.checkin_mark_requested, 'check-in marking is outside kiosk_mode_checkin'],
    ['kiosk_ui_session_requested', input.kiosk_ui_session_requested, 'kiosk UI/session creation is outside this seed'],
    ['device_enrollment_requested', input.device_enrollment_requested, 'device enrollment is outside this seed'],
    ['token_override_requested', input.token_override_requested, 'token override requires separate approval'],
    ['persistence_requested', input.persistence_requested, 'persistence is outside the exact FFET scope'],
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

function decide(input: { kioskModeActive: boolean; tokenStatus: KioskTokenStatus; timeWindowStatus: KioskWindowStatus }): KioskModeCheckinDecision {
  if (!input.kioskModeActive) {
    return 'KIOSK_DISABLED';
  }
  if (input.tokenStatus !== 'valid') {
    return 'TOKEN_REJECTED';
  }
  if (input.timeWindowStatus === 'too_early' || input.timeWindowStatus === 'too_late') {
    return 'WINDOW_REJECTED';
  }
  if (input.timeWindowStatus === 'review') {
    return 'KIOSK_REQUIRES_REVIEW';
  }
  return 'KIOSK_CHECKIN_ALLOWED';
}

function digestRuntime(receiptWithoutDigest: Omit<KioskModeCheckinRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateKioskModeCheckin(input: KioskModeCheckinInput): KioskModeCheckinRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const decision = decide({ kioskModeActive: input.kiosk_mode_active, tokenStatus: input.token_status, timeWindowStatus: input.time_window_status });

  const receiptWithoutDigest: Omit<KioskModeCheckinRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_KIOSK_MODE_CHECKIN_SEED_ID,
    component_id: PHASE_6C_KIOSK_MODE_CHECKIN_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CKioskModeCheckin",
    event_name: KIOSK_MODE_CHECKIN_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: serviceManifestContract,
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    kiosk_session_ref: requireNonEmpty(input.kiosk_session_ref, 'kiosk_session_ref'),
    kiosk_device_ref: requireNonEmpty(input.kiosk_device_ref, 'kiosk_device_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_issue_ref: requireNonEmpty(input.ticket_issue_ref, 'ticket_issue_ref'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    kiosk_mode_active: input.kiosk_mode_active,
    token_status: input.token_status,
    time_window_status: input.time_window_status,
    decision,
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      registration_context: '6C.08',
      signed_ticket_token_ref: optionalRef(input.signed_ticket_token_ref, 'signed_ticket_token_ref'),
      checkin_time_window_ref: optionalRef(input.checkin_time_window_ref, 'checkin_time_window_ref'),
      person_identity_ref: optionalRef(input.person_identity_ref, 'person_identity_ref'),
      access_audit_ref: optionalRef(input.access_audit_ref, 'access_audit_ref'),
      crm_event_ref: optionalRef(input.crm_event_ref, 'crm_event_ref'),
    },
    decision_refs: ["6C-EVENT-CHECK-004", "6C-EVENT-CHECK-014", "6C-GLOBAL-018"],
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
