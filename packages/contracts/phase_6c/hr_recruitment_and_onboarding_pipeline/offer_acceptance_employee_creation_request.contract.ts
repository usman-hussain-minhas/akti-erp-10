export const PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_SEED_ID = 'seed_6c_016_offer_acceptance_employee_creation_request' as const;
export const PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_COMPONENT_ID = '6C.02' as const;
export const OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.offer_acceptance_employee_creation_request.recommended' as const;

export type OfferAcceptanceStatus = 'ACCEPTED';
export type EmployeeCreationRequestStatus = 'RECOMMENDED_EXPLICIT_STEP_REQUIRED';

export type EmployeeCreationProfileDraft = {
  legal_name: string;
  work_email: string;
  start_date: string;
  department_ref: string;
  position_ref: string;
  manager_employee_ref?: string;
};

export type OfferAcceptanceEmployeeCreationRequestInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  offer_ref: string;
  offer_acceptance_status: OfferAcceptanceStatus;
  accepted_by_actor_ref: string;
  accepted_at: string;
  employee_creation_requested_by_user_id: string;
  evaluated_at: string;
  profile_draft: EmployeeCreationProfileDraft;
  control_metadata?: Record<string, unknown>;
  auto_employee_creation_requested?: boolean;
  employee_record_mutation_requested?: boolean;
  person_identity_mutation_requested?: boolean;
  access_provisioning_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type EmployeeCreationRecommendationPayload = {
  applicant_ref: string;
  offer_ref: string;
  accepted_by_actor_ref: string;
  accepted_at: string;
  profile_draft: EmployeeCreationProfileDraft;
};

export type OfferAcceptanceEmployeeCreationRequestReceipt = {
  seed_id: typeof PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_SEED_ID;
  component_id: typeof PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6COfferAcceptanceEmployeeCreationRequest';
  event_name: typeof OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: EmployeeCreationRequestStatus;
  acceptance_recommends_employee_creation: true;
  employee_creation_explicit_step_required: true;
  employee_creation_executed: false;
  employee_record_mutation_allowed: false;
  person_identity_mutation_allowed: false;
  access_provisioning_executed: false;
  recommendation_payload: EmployeeCreationRecommendationPayload;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  employee_creation_requested_by_user_id: string;
  evaluated_at: string;
  offer_acceptance_employee_creation_request_evidence_digest: string;
};
