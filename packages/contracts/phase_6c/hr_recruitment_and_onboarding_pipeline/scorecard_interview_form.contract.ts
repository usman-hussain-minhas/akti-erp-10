export const PHASE_6C_SCORECARD_INTERVIEW_FORM_SEED_ID = 'seed_6c_013_scorecard_interview_form' as const;
export const PHASE_6C_SCORECARD_INTERVIEW_FORM_COMPONENT_ID = '6C.02' as const;
export const SCORECARD_INTERVIEW_FORM_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.scorecard_interview_form.configuration_validated' as const;

export type ScorecardInterviewQuestionType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'RATING' | 'DATE';
export type ScorecardInterviewOutcome = 'ADVANCE' | 'HOLD' | 'REJECT' | 'MANUAL_REVIEW';
export type ScorecardInterviewCandidateSource = 'DIRECT_FORM' | 'CRM_LINKED';

export type ScorecardInterviewQuestionOption = {
  option_code: string;
  label: string;
  score_value?: number;
};

export type ScorecardInterviewQuestionConfig = {
  question_code: string;
  label: string;
  question_type: ScorecardInterviewQuestionType;
  required: boolean;
  weight: number;
  max_score?: number;
  competency_code?: string;
  evidence_required?: boolean;
  options?: readonly ScorecardInterviewQuestionOption[];
};

export type ScorecardInterviewSectionConfig = {
  section_code: string;
  label: string;
  order: number;
  weight: number;
  questions: readonly ScorecardInterviewQuestionConfig[];
};

export type ScorecardInterviewScoreBand = {
  band_code: string;
  label: string;
  min_score: number;
  max_score: number;
  outcome: ScorecardInterviewOutcome;
};

export type ScorecardInterviewFormRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  configuration_engine_form_ref: string;
  form_code: string;
  form_label: string;
  form_version: string;
  interview_stage_code: string;
  candidate_source: ScorecardInterviewCandidateSource;
  crm_lead_ref?: string;
  configured_by_user_id: string;
  evaluated_at: string;
  sections: readonly ScorecardInterviewSectionConfig[];
  score_bands: readonly ScorecardInterviewScoreBand[];
  control_metadata?: Record<string, unknown>;
  hardcoded_form_requested?: boolean;
  schema_mutation_requested?: boolean;
  crm_stage_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ScorecardInterviewNormalizedQuestion = {
  question_code: string;
  question_type: ScorecardInterviewQuestionType;
  weight: number;
  max_score: number;
  weighted_available_score: number;
  competency_code?: string;
  evidence_required: boolean;
};

export type ScorecardInterviewNormalizedSection = {
  section_code: string;
  order: number;
  weight: number;
  question_count: number;
  weighted_available_score: number;
  questions: readonly ScorecardInterviewNormalizedQuestion[];
};

export type ScorecardInterviewFormRuntimeReceipt = {
  seed_id: typeof PHASE_6C_SCORECARD_INTERVIEW_FORM_SEED_ID;
  component_id: typeof PHASE_6C_SCORECARD_INTERVIEW_FORM_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CScorecardInterviewForm';
  event_name: typeof SCORECARD_INTERVIEW_FORM_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  configuration_engine_form_ref: string;
  form_code: string;
  form_version: string;
  interview_stage_code: string;
  candidate_source: ScorecardInterviewCandidateSource;
  crm_lead_ref?: string;
  runtime_status: 'CONFIGURATION_ENGINE_SCORECARD_READY';
  configuration_engine_required: true;
  hardcoded_form_allowed: false;
  crm_stage_mutation_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  question_count: number;
  scored_question_count: number;
  required_question_count: number;
  section_count: number;
  score_band_count: number;
  total_available_score: number;
  normalized_sections: readonly ScorecardInterviewNormalizedSection[];
  score_bands: readonly ScorecardInterviewScoreBand[];
  decision_refs: readonly string[];
  external_dependency_conditions: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  configured_by_user_id: string;
  evaluated_at: string;
  scorecard_interview_form_evidence_digest: string;
};
