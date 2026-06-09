export const PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_SEED_ID = 'seed_6c_019_background_check_provider_boundary' as const;
export const PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_COMPONENT_ID = '6C.02' as const;
export const BACKGROUND_CHECK_PROVIDER_BOUNDARY_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.background_check_provider_boundary.validated' as const;

export type BackgroundCheckScope = 'IDENTITY' | 'EMPLOYMENT_HISTORY' | 'EDUCATION' | 'CRIMINAL_RECORD' | 'REFERENCE';
export type BackgroundCheckConsentStatus = 'CONSENT_CAPTURED';
export type BackgroundCheckBoundaryStatus = 'PROVIDER_NEUTRAL_BOUNDARY_READY';

export type BackgroundCheckScopeRequest = {
  scope_code: BackgroundCheckScope;
  reason: string;
  required: boolean;
};

export type BackgroundCheckProviderBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  offer_ref?: string;
  provider_boundary_ref: string;
  consent_status: BackgroundCheckConsentStatus;
  consent_evidence_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  scopes: readonly BackgroundCheckScopeRequest[];
  control_metadata?: Record<string, unknown>;
  real_provider_requested?: boolean;
  provider_credentials_requested?: boolean;
  adapter_execution_requested?: boolean;
  external_submission_requested?: boolean;
  sensitive_result_storage_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type BackgroundCheckProviderBoundaryPayload = {
  applicant_ref: string;
  offer_ref?: string;
  provider_boundary_ref: string;
  consent_evidence_ref: string;
  scopes: readonly BackgroundCheckScopeRequest[];
};

export type BackgroundCheckProviderBoundaryReceipt = {
  seed_id: typeof PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CBackgroundCheckProviderBoundary';
  event_name: typeof BACKGROUND_CHECK_PROVIDER_BOUNDARY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: BackgroundCheckBoundaryStatus;
  provider_neutral_boundary_only: true;
  real_provider_allowed: false;
  provider_credentials_allowed: false;
  adapter_execution_allowed: false;
  external_submission_allowed: false;
  sensitive_result_storage_allowed: false;
  consent_required: true;
  scope_count: number;
  required_scope_count: number;
  boundary_payload: BackgroundCheckProviderBoundaryPayload;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  requested_by_user_id: string;
  evaluated_at: string;
  background_check_provider_boundary_evidence_digest: string;
};
