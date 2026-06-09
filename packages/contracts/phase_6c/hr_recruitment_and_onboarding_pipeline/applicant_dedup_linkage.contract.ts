export const PHASE_6C_APPLICANT_DEDUP_LINKAGE_SEED_ID = 'seed_6c_022_applicant_dedup_linkage' as const;
export const PHASE_6C_APPLICANT_DEDUP_LINKAGE_COMPONENT_ID = '6C.02' as const;
export const APPLICANT_DEDUP_LINKAGE_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_dedup_linkage.evaluated' as const;

export type ApplicantDedupSignalType = 'EMAIL_HASH' | 'PHONE_HASH' | 'PERSON_IDENTITY_REF' | 'CRM_LEAD_REF' | 'EXTERNAL_APPLICANT_REF';
export type ApplicantDedupCandidateSource = 'APPLICANT' | 'CRM_LEAD' | 'PERSON_IDENTITY_REF';
export type ApplicantDedupOutcome = 'NO_DUPLICATE_MATCH' | 'POTENTIAL_DUPLICATE_LINKS_FOUND';

export type ApplicantDedupSignal = {
  signal_type: ApplicantDedupSignalType;
  signal_value: string;
};

export type ApplicantDedupPatternWeight = {
  signal_type: ApplicantDedupSignalType;
  weight: number;
};

export type ApplicantDedupPattern = {
  pattern_ref: string;
  threshold_score: number;
  signal_weights: readonly ApplicantDedupPatternWeight[];
};

export type ApplicantDedupCandidate = {
  candidate_ref: string;
  source: ApplicantDedupCandidateSource;
  active: boolean;
  signals: readonly ApplicantDedupSignal[];
};

export type ApplicantDedupLinkageInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  dedup_pattern: ApplicantDedupPattern;
  applicant_signals: readonly ApplicantDedupSignal[];
  candidates: readonly ApplicantDedupCandidate[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  destructive_merge_requested?: boolean;
  direct_crm_mutation_requested?: boolean;
  applicant_record_mutation_requested?: boolean;
  person_identity_graph_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ApplicantDedupCandidateMatch = {
  candidate_ref: string;
  source: ApplicantDedupCandidateSource;
  score: number;
  matched_signal_types: readonly ApplicantDedupSignalType[];
  recommended_linkage_ref: string;
};

export type ApplicantDedupLinkageReceipt = {
  seed_id: typeof PHASE_6C_APPLICANT_DEDUP_LINKAGE_SEED_ID;
  component_id: typeof PHASE_6C_APPLICANT_DEDUP_LINKAGE_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CApplicantDedupLinkage';
  event_name: typeof APPLICANT_DEDUP_LINKAGE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  runtime_status: 'APPLICANT_DEDUP_LINKAGE_EVALUATED';
  dedup_pattern_ref: string;
  threshold_score: number;
  outcome: ApplicantDedupOutcome;
  retain_and_link_only: true;
  destructive_merge_allowed: false;
  direct_crm_mutation_allowed: false;
  applicant_record_mutation_allowed: false;
  person_identity_graph_mutation_allowed: false;
  crm_patterns_reused: true;
  candidate_count: number;
  active_candidate_count: number;
  match_count: number;
  matches: readonly ApplicantDedupCandidateMatch[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  applicant_dedup_linkage_evidence_digest: string;
};
