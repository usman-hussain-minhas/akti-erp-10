export const PHASE_6C_MANUAL_CHECKIN_OVERRIDE_SEED_ID = 'seed_6c_116_manual_checkin_override' as const;
export const PHASE_6C_MANUAL_CHECKIN_OVERRIDE_COMPONENT_ID = '6C.09' as const;
export const MANUAL_CHECKIN_OVERRIDE_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.manual_checkin_override.runtime_evaluated' as const;

export type ManualCheckinOverrideDecision =
  | 'MANUAL_OVERRIDE_APPROVED'
  | 'MANUAL_OVERRIDE_REQUIRES_APPROVAL'
  | 'MANUAL_OVERRIDE_REJECTED_ALREADY_CHECKED_IN'
  | 'MANUAL_OVERRIDE_REJECTED_INELIGIBLE_CONTEXT'
  | 'MANUAL_OVERRIDE_REJECTED_REASON_REQUIRED';

export type ManualCheckinOverrideApprovalStatus = 'approved' | 'pending' | 'rejected';
export type ManualCheckinOverrideEligibilityStatus = 'eligible' | 'ineligible' | 'review';

export type ManualCheckinOverrideInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  session_ref?: string;
  override_reason: string;
  approval_status: ManualCheckinOverrideApprovalStatus;
  approval_ref?: string;
  approved_by_user_id?: string;
  requested_by_user_id: string;
  evaluated_at: string;
  source_record_ref: string;
  eligibility_status?: ManualCheckinOverrideEligibilityStatus;
  existing_checkin_ref?: string;
  control_metadata?: Record<string, unknown>;
  checkin_record_creation_requested?: boolean;
  ticket_mutation_requested?: boolean;
  session_capacity_mutation_requested?: boolean;
  attendance_persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type ManualCheckinOverrideRuntimeReceipt = {
  seed_id: typeof PHASE_6C_MANUAL_CHECKIN_OVERRIDE_SEED_ID;
  component_id: typeof PHASE_6C_MANUAL_CHECKIN_OVERRIDE_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CManualCheckinOverride';
  event_name: typeof MANUAL_CHECKIN_OVERRIDE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_ref: string;
  session_ref: string | null;
  source_record_ref: string;
  decision: ManualCheckinOverrideDecision;
  override_reason: string;
  approval_status: ManualCheckinOverrideApprovalStatus;
  approval_ref: string | null;
  approved_by_user_id: string | null;
  requested_by_user_id: string;
  eligibility_status: ManualCheckinOverrideEligibilityStatus;
  existing_checkin_ref: string | null;
  manual_override_allowed: boolean;
  approval_required: boolean;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
