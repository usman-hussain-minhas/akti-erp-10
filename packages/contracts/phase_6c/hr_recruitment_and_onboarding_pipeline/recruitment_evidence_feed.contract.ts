export const PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID = 'seed_6c_023_recruitment_evidence_feed' as const;
export const PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID = '6C.02' as const;
export const RECRUITMENT_EVIDENCE_FEED_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.recruitment_evidence_feed.emitted' as const;

export type RecruitmentEvidenceType =
  | 'APPLICATION_CREATED'
  | 'STAGE_CHANGED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_DECISION'
  | 'OFFER_ACCEPTED'
  | 'ONBOARDING_STARTED'
  | 'REJECTION_RECORDED';

export type RecruitmentEvidenceEvent = {
  evidence_ref: string;
  evidence_type: RecruitmentEvidenceType;
  subject_ref: string;
  source_seed_id: string;
  occurred_at: string;
  outcome_code?: string;
  evidence_value?: string;
};

export type RecruitmentEvidenceFeedInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  feed_ref: string;
  emitted_by_user_id: string;
  emitted_at: string;
  events: readonly RecruitmentEvidenceEvent[];
  control_metadata?: Record<string, unknown>;
  performance_calculation_requested?: boolean;
  optimization_execution_requested?: boolean;
  direct_6d_write_requested?: boolean;
  direct_crm_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type RecruitmentEvidenceTypeCount = {
  evidence_type: RecruitmentEvidenceType;
  count: number;
};

export type RecruitmentEvidenceFeedReceipt = {
  seed_id: typeof PHASE_6C_RECRUITMENT_EVIDENCE_FEED_SEED_ID;
  component_id: typeof PHASE_6C_RECRUITMENT_EVIDENCE_FEED_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CRecruitmentEvidenceFeed';
  event_name: typeof RECRUITMENT_EVIDENCE_FEED_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'RECRUITMENT_EVIDENCE_FEED_READY';
  feed_ref: string;
  event_feed_only: true;
  performance_calculation_executed: false;
  optimization_execution_allowed: false;
  phase_6d_dependency_allowed: false;
  direct_crm_mutation_allowed: false;
  event_count: number;
  subject_count: number;
  evidence_refs: readonly string[];
  type_counts: readonly RecruitmentEvidenceTypeCount[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  emitted_by_user_id: string;
  emitted_at: string;
  recruitment_evidence_feed_digest: string;
};
