export const PHASE_6C_RECRUITMENT_STAGE_CONFIG_SEED_ID = "seed_6c_012_recruitment_stage_config" as const;
export const PHASE_6C_RECRUITMENT_STAGE_CONFIG_COMPONENT_ID = "6C.02" as const;
export const RECRUITMENT_STAGE_CONFIG_EVENT = "phase_6c.hr_recruitment_and_onboarding_pipeline.recruitment_stage_config.runtime_evaluated" as const;

export type RecruitmentStageKind = 'ENTRY' | 'INTERMEDIATE' | 'TERMINAL';
export type RecruitmentStageOutcome = 'CONTINUE' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

export type RecruitmentStageDefinition = {
  stage_code: string;
  stage_label: string;
  stage_order: number;
  stage_kind: RecruitmentStageKind;
  terminal_outcome?: RecruitmentStageOutcome;
  allowed_next_stage_codes: readonly string[];
  active: boolean;
};

export type RecruitmentStageConfigRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  stages: readonly RecruitmentStageDefinition[];
  control_metadata?: Record<string, unknown>;
  hardcoded_stage_names_requested?: boolean;
  crm_stage_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RecruitmentStageConfigReceipt = {
  seed_id: typeof PHASE_6C_RECRUITMENT_STAGE_CONFIG_SEED_ID;
  component_id: typeof PHASE_6C_RECRUITMENT_STAGE_CONFIG_COMPONENT_ID;
  component_slug: "hr_recruitment_and_onboarding_pipeline";
  model_name: "Phase6CRecruitmentStageConfig";
  event_name: typeof RECRUITMENT_STAGE_CONFIG_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'RECRUITMENT_STAGE_CONFIG_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  fully_configurable_stages: true;
  crm_stage_mutation_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  stages: readonly RecruitmentStageDefinition[];
  stage_counts: {
    total_stages: number;
    active_stages: number;
    entry_stages: number;
    terminal_stages: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
