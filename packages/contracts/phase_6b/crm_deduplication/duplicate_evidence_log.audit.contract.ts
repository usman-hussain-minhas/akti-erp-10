export const PHASE_6B_DUPLICATE_EVIDENCE_LOG_SEED_ID = 'seed_6b_05_duplicate_evidence_log' as const;
export const PHASE_6B_DUPLICATE_EVIDENCE_LOG_COMPONENT_ID = '6B.05' as const;

export const DUPLICATE_EVIDENCE_LOG_EVENT = 'phase_6b.crm_deduplication.duplicate_evidence_log.recorded' as const;

export type DuplicateEvidenceKind =
  | 'MATCH_CANDIDATE_EVIDENCE'
  | 'MERGE_DECISION_EVIDENCE'
  | 'IDENTITY_LINK_EVIDENCE'
  | 'DUPLICATE_REJECTION_EVIDENCE'
  | 'OPERATOR_REVIEW_EVIDENCE';

export type DuplicateEvidenceSource =
  | 'UNIFIED_LEAD_RECORD_AUTHORITY'
  | 'PERSON_IDENTITY_GRAPH'
  | 'MATCH_CANDIDATE_GENERATION'
  | 'MERGE_DECISION_RECORD'
  | 'IDENTITY_RESOLUTION_LINKING'
  | 'OPERATOR_REVIEW';

export type DuplicateEvidenceItem = {
  evidence_item_id: string;
  evidence_kind: DuplicateEvidenceKind;
  evidence_source: DuplicateEvidenceSource;
  lead_record_id: string;
  lead_record_authority_id: string;
  person_identity_graph_id: string;
  evidence_ref: string;
  confidence_score?: number;
  reason_codes: string[];
};

export type DuplicateEvidenceLogInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  duplicate_evidence_log_id: string;
  dedup_run_id: string;
  subject_lead_record_id: string;
  subject_lead_record_authority_id: string;
  subject_person_identity_graph_id: string;
  recorded_by_user_id: string;
  recorded_at: string;
  audit_reason: string;
  evidence_items: DuplicateEvidenceItem[];
  merge_execution_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type DuplicateEvidenceLogReceipt = {
  seed_id: typeof PHASE_6B_DUPLICATE_EVIDENCE_LOG_SEED_ID;
  component_id: typeof PHASE_6B_DUPLICATE_EVIDENCE_LOG_COMPONENT_ID;
  event_name: typeof DUPLICATE_EVIDENCE_LOG_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  duplicate_evidence_log_id: string;
  dedup_run_id: string;
  subject_lead_record_id: string;
  subject_lead_record_authority_id: string;
  subject_person_identity_graph_id: string;
  recorded_by_user_id: string;
  recorded_at: string;
  audit_reason: string;
  evidence_count: number;
  evidence_items: readonly DuplicateEvidenceItem[];
  append_only_audit_log_enforced: true;
  lead_record_authority_dependency_confirmed: true;
  person_identity_graph_dependency_confirmed: true;
  merge_execution_allowed: false;
  irreversible_action_allowed: false;
};
