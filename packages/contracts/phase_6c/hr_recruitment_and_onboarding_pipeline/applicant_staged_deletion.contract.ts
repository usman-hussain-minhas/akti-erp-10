export const PHASE_6C_APPLICANT_STAGED_DELETION_SEED_ID = 'seed_6c_021_applicant_staged_deletion' as const;
export const PHASE_6C_APPLICANT_STAGED_DELETION_COMPONENT_ID = '6C.02' as const;
export const APPLICANT_STAGED_DELETION_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_staged_deletion.evaluated' as const;

export type ApplicantDeletionStage =
  | 'ACTIVE'
  | 'SOFT_DELETE_REQUESTED'
  | 'SOFT_DELETED'
  | 'PERMANENT_DELETION_SCHEDULED'
  | 'DELETION_BLOCKED'
  | 'DELETION_CANCELLED';

export type ApplicantDeletionAction =
  | 'REQUEST_SOFT_DELETE'
  | 'CONFIRM_SOFT_DELETE'
  | 'SCHEDULE_PERMANENT_DELETION'
  | 'CANCEL_DELETION';

export type ApplicantDeletionProtectionRef = {
  protection_ref: string;
  reason: string;
  active: boolean;
};

export type ApplicantStagedDeletionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  requested_action: ApplicantDeletionAction;
  current_stage: ApplicantDeletionStage;
  requested_by_user_id: string;
  requested_at: string;
  retention_policy_ref: string;
  permanent_deletion_not_before?: string;
  crm_lead_ref?: string;
  employee_creation_request_ref?: string;
  protection_refs: readonly ApplicantDeletionProtectionRef[];
  control_metadata?: Record<string, unknown>;
  immediate_deletion_requested?: boolean;
  hard_delete_execution_requested?: boolean;
  direct_crm_mutation_requested?: boolean;
  employee_record_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ApplicantStagedDeletionReceipt = {
  seed_id: typeof PHASE_6C_APPLICANT_STAGED_DELETION_SEED_ID;
  component_id: typeof PHASE_6C_APPLICANT_STAGED_DELETION_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CApplicantStagedDeletion';
  event_name: typeof APPLICANT_STAGED_DELETION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  runtime_status: 'APPLICANT_STAGED_DELETION_EVALUATED';
  requested_action: ApplicantDeletionAction;
  previous_stage: ApplicantDeletionStage;
  resulting_stage: ApplicantDeletionStage;
  deletion_execution_performed: false;
  immediate_deletion_allowed: false;
  hard_delete_allowed: false;
  direct_crm_mutation_allowed: false;
  employee_record_mutation_allowed: false;
  refs_events_only: true;
  retention_policy_ref: string;
  permanent_deletion_not_before: string | null;
  active_protection_refs: readonly string[];
  inactive_protection_refs: readonly string[];
  blocked: boolean;
  block_reasons: readonly string[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  requested_by_user_id: string;
  requested_at: string;
  applicant_staged_deletion_evidence_digest: string;
};
