export const PHASE_6C_CHECKIN_TIME_WINDOW_SEED_ID = "seed_6c_113_checkin_time_window" as const;
export const PHASE_6C_CHECKIN_TIME_WINDOW_COMPONENT_ID = "6C.09" as const;
export const CHECKIN_TIME_WINDOW_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.checkin_time_window.runtime_evaluated" as const;

export type CheckinTimeWindowDecision = 'CHECKIN_ALLOWED' | 'CHECKIN_TOO_EARLY' | 'CHECKIN_TOO_LATE' | 'CHECKIN_REQUIRES_REVIEW';

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
