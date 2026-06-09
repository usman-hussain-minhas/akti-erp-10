export const PHASE_6C_APPLICANT_SOURCE_LINKAGE_SEED_ID = "seed_6c_011_applicant_source_linkage" as const;
export const PHASE_6C_APPLICANT_SOURCE_LINKAGE_COMPONENT_ID = "6C.02" as const;
export const APPLICANT_SOURCE_LINKAGE_EVENT = "phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_source_linkage.runtime_evaluated" as const;

export type ApplicantSourceType = 'DIRECT_HR_FORM' | 'CRM_LEAD';
export type ApplicantSourceLinkageStatus = 'DIRECT_SOURCE_LINKED' | 'CRM_SOURCE_LINKED';

export type ApplicantSourceLinkageRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  applicant_ref: string;
  applicant_person_anchor_ref?: string;
  source_type: ApplicantSourceType;
  direct_hr_form_ref?: string;
  crm_lead_ref?: string;
  crm_pipeline_ref?: string;
  control_metadata?: Record<string, unknown>;
  crm_lead_creation_requested?: boolean;
  crm_lead_mutation_requested?: boolean;
  employee_creation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ApplicantSourceLinkageReceipt = {
  seed_id: typeof PHASE_6C_APPLICANT_SOURCE_LINKAGE_SEED_ID;
  component_id: typeof PHASE_6C_APPLICANT_SOURCE_LINKAGE_COMPONENT_ID;
  component_slug: "hr_recruitment_and_onboarding_pipeline";
  model_name: "Phase6CApplicantSourceLinkage";
  event_name: typeof APPLICANT_SOURCE_LINKAGE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: ApplicantSourceLinkageStatus;
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  crm_dependency_condition: 'lead_sourced_applicant_active' | 'not_applicable';
  crm_mutation_allowed: false;
  employee_creation_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  applicant_ref: string;
  applicant_person_anchor_ref?: string;
  source_type: ApplicantSourceType;
  direct_hr_form_ref?: string;
  crm_lead_ref?: string;
  crm_pipeline_ref?: string;
  linkage_evidence_ref: string;
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
