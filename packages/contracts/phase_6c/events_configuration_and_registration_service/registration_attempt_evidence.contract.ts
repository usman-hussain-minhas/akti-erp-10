export const PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_SEED_ID = "seed_6c_109_registration_attempt_evidence" as const;
export const PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_COMPONENT_ID = "6C.08" as const;
export const REGISTRATION_ATTEMPT_EVIDENCE_RUNTIME_EVENT = "phase_6c.events_configuration_and_registration_service.registration_attempt_evidence.runtime_evaluated" as const;

export type RegistrationAttemptOutcome =
  | 'registration_created'
  | 'approval_pending'
  | 'payment_pending'
  | 'waitlisted'
  | 'capacity_blocked'
  | 'validation_rejected'
  | 'duplicate_rejected'
  | 'system_rejected';

export type RegistrationAttemptEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  attempt_ref: string;
  event_config_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  attempted_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  outcome: RegistrationAttemptOutcome;
  registration_ref?: string;
  approval_ref?: string;
  payment_saga_ref?: string;
  waitlist_ref?: string;
  capacity_snapshot_ref?: string;
  product_catalogue_anchor_ref?: string;
  crm_handoff_ref?: string;
  workspace_calendar_ref?: string;
  rejection_code?: string;
  rejection_reason?: string;
  control_metadata?: Record<string, unknown>;
  registration_mutation_requested?: boolean;
  payment_capture_requested?: boolean;
  waitlist_mutation_requested?: boolean;
  approval_mutation_requested?: boolean;
  evidence_persistence_requested?: boolean;
  event_publish_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type RegistrationAttemptEvidenceRuntimeReceipt = {
  seed_id: typeof PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_REGISTRATION_ATTEMPT_EVIDENCE_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CRegistrationAttemptEvidence";
  event_name: typeof REGISTRATION_ATTEMPT_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  attempt_ref: string;
  event_config_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  source_record_ref: string;
  attempted_at: string;
  outcome: RegistrationAttemptOutcome;
  registration_ref: string | null;
  approval_ref: string | null;
  payment_saga_ref: string | null;
  waitlist_ref: string | null;
  capacity_snapshot_ref: string | null;
  rejection_code: string | null;
  rejection_reason: string | null;
  dependency_trace: {
    service_manifest_contract: string;
    product_catalogue_anchor_ref: string | null;
    crm_handoff_ref: string | null;
    workspace_calendar_ref: string | null;
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};
