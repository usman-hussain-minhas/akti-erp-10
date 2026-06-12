export const PHASE_6C_FEEDBACK_IDENTITY_POLICY_SEED_ID = 'seed_6c_121_feedback_identity_policy' as const;
export const PHASE_6C_FEEDBACK_IDENTITY_POLICY_COMPONENT_ID = '6C.09' as const;
export const FEEDBACK_IDENTITY_POLICY_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.feedback_identity_policy.runtime_evaluated' as const;

export type FeedbackIdentityMode = 'anonymous_allowed' | 'identified_required' | 'mixed_allowed';
export type FeedbackIdentityDecision = 'FEEDBACK_IDENTITY_POLICY_ALLOWED' | 'FEEDBACK_IDENTITY_REQUIRES_IDENTITY' | 'FEEDBACK_IDENTITY_REJECTED_POLICY_CONFLICT' | 'FEEDBACK_IDENTITY_REQUIRES_REVIEW';

export type FeedbackIdentityPolicyInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  form_ref: string;
  source_record_ref: string;
  identity_mode: FeedbackIdentityMode;
  response_is_anonymous: boolean;
  attendee_ref?: string;
  registration_ref?: string;
  crm_lead_ref?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  response_collection_requested?: boolean;
  identity_persistence_requested?: boolean;
  crm_write_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type FeedbackIdentityPolicyRuntimeReceipt = {
  seed_id: typeof PHASE_6C_FEEDBACK_IDENTITY_POLICY_SEED_ID;
  component_id: typeof PHASE_6C_FEEDBACK_IDENTITY_POLICY_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CFeedbackIdentityPolicy';
  event_name: typeof FEEDBACK_IDENTITY_POLICY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  form_ref: string;
  source_record_ref: string;
  decision: FeedbackIdentityDecision;
  identity_mode: FeedbackIdentityMode;
  response_is_anonymous: boolean;
  attendee_ref: string | null;
  registration_ref: string | null;
  crm_lead_ref: string | null;
  identity_required: boolean;
  crm_handoff_allowed: boolean;
  rejection_reasons: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
