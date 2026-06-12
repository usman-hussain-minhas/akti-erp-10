export const PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID = 'seed_6c_117_duplicate_checkin_exception' as const;
export const PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID = '6C.09' as const;
export const DUPLICATE_CHECKIN_EXCEPTION_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.duplicate_checkin_exception.runtime_evaluated' as const;

export type DuplicateCheckinExceptionDecision =
  | 'CHECKIN_ACCEPTED_NO_DUPLICATE'
  | 'DUPLICATE_CHECKIN_BLOCKED'
  | 'DUPLICATE_CHECKIN_REQUIRES_REVIEW'
  | 'DUPLICATE_CHECKIN_CONTEXT_INVALID';

export type DuplicateCheckinScope = 'event' | 'session' | 'ticket';
export type DuplicateCheckinSeverity = 'none' | 'low' | 'medium' | 'high';

export type PriorCheckinEvidence = {
  checkin_ref: string;
  checked_in_at: string;
  checkpoint_ref: string;
  operator_user_id: string;
};

export type DuplicateCheckinExceptionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  checkin_scope: DuplicateCheckinScope;
  attempted_checkin_ref: string;
  attempted_at: string;
  attempted_checkpoint_ref: string;
  attempted_operator_user_id: string;
  source_record_ref: string;
  prior_checkins: readonly PriorCheckinEvidence[];
  session_ref?: string;
  allow_manual_review?: boolean;
  control_metadata?: Record<string, unknown>;
  duplicate_persistence_requested?: boolean;
  checkin_record_creation_requested?: boolean;
  ticket_mutation_requested?: boolean;
  attendance_persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type DuplicateCheckinExceptionRuntimeReceipt = {
  seed_id: typeof PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID;
  component_id: typeof PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CDuplicateCheckinException';
  event_name: typeof DUPLICATE_CHECKIN_EXCEPTION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  session_ref: string | null;
  source_record_ref: string;
  checkin_scope: DuplicateCheckinScope;
  attempted_checkin_ref: string;
  attempted_at: string;
  attempted_checkpoint_ref: string;
  attempted_operator_user_id: string;
  decision: DuplicateCheckinExceptionDecision;
  duplicate_detected: boolean;
  exception_record_required: boolean;
  manual_review_required: boolean;
  severity: DuplicateCheckinSeverity;
  matched_prior_checkin_refs: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
