export const PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_SEED_ID = 'seed_6c_104_approval_required_registration' as const;
export const PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_COMPONENT_ID = '6C.08' as const;
export const APPROVAL_REQUIRED_REGISTRATION_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.approval_required_registration.runtime_evaluated' as const;

export type ApprovalRequiredRegistrationDecision = 'APPROVAL_NOT_REQUIRED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPROVAL_REQUIRES_REVIEW';
export type ApprovalActionKind = 'APPROVED' | 'REJECTED';

export type ApprovalActionEvidence = {
  reviewer_ref: string;
  action: ApprovalActionKind;
  action_at: string;
  approval_evidence_ref: string;
  reason_ref?: string;
};

export type ApprovalRequiredRegistrationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  submitted_at: string;
  approval_required: boolean;
  approval_policy_ref?: string;
  required_approval_count?: number;
  approval_actions?: readonly ApprovalActionEvidence[];
  control_metadata?: Record<string, unknown>;
  approval_mutation_requested?: boolean;
  registration_creation_requested?: boolean;
  ticket_issue_requested?: boolean;
  notification_send_requested?: boolean;
  payment_capture_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type ApprovalRequiredRegistrationRuntimeReceipt = {
  seed_id: typeof PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_SEED_ID;
  component_id: typeof PHASE_6C_APPROVAL_REQUIRED_REGISTRATION_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CApprovalRequiredRegistration';
  event_name: typeof APPROVAL_REQUIRED_REGISTRATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  registration_ref: string;
  attendee_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  submitted_at: string;
  approval_required: boolean;
  approval_policy_ref?: string;
  required_approval_count: number;
  approval_count: number;
  rejection_count: number;
  reviewer_refs: readonly string[];
  decision: ApprovalRequiredRegistrationDecision;
  decision_reason: string;
  approval_mutation_performed: false;
  registration_creation_performed: false;
  ticket_issue_performed: false;
  notification_send_performed: false;
  payment_capture_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  approval_required_registration_runtime_digest: string;
};
