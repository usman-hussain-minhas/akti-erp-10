export const PHASE_6B_MANUAL_RECONCILIATION_PATH_SEED_ID = 'seed_6b_10_manual_reconciliation_path' as const;
export const PHASE_6B_MANUAL_RECONCILIATION_PATH_COMPONENT_ID = '6B.10' as const;

export const MANUAL_RECONCILIATION_PATH_EVENT = 'phase_6b.payment_collection_topup.manual_reconciliation.review_recorded' as const;

export type ManualReconciliationCandidateType = 'BANK_STATEMENT_IMPORT' | 'PROVIDER_REFERENCE' | 'CASH_COUNTER' | 'ADJUSTMENT_REVIEW';
export type ManualReconciliationDecision = 'OPEN_REVIEW' | 'MATCHED_PENDING_ALLOCATION' | 'UNMATCHED' | 'ESCALATED';
export type ManualReconciliationStatus = 'OPEN_MANUAL_REVIEW' | 'MATCHED_PENDING_ALLOCATION' | 'UNMATCHED' | 'ESCALATED';

export type ManualReconciliationCandidate = {
  reconciliation_candidate_ref: string;
  candidate_type: ManualReconciliationCandidateType;
  candidate_source_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref?: string;
  amount_minor: number;
  currency_code: string;
  observed_at: string;
  candidate_reason: string;
  confidence_score: number;
};

export type ManualReconciliationReviewInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  reviewer_user_id: string;
  reviewed_at: string;
  candidate: ManualReconciliationCandidate;
  decision: ManualReconciliationDecision;
  decision_reason: string;
  api_key_scope_registry_ref?: string;
  provider_callback_processing_requested?: boolean;
  payment_allocation_requested?: boolean;
  auto_reconciliation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ManualReconciliationPathReceipt = {
  seed_id: typeof PHASE_6B_MANUAL_RECONCILIATION_PATH_SEED_ID;
  component_id: typeof PHASE_6B_MANUAL_RECONCILIATION_PATH_COMPONENT_ID;
  event_name: typeof MANUAL_RECONCILIATION_PATH_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  reviewer_user_id: string;
  reviewed_at: string;
  reconciliation_candidate_ref: string;
  candidate_type: ManualReconciliationCandidateType;
  candidate_source_ref: string;
  invoice_record_ref: string;
  pricing_table_effective_date_ref: string;
  payment_evidence_ref: string;
  provider_transaction_evidence_ref?: string;
  amount_minor: number;
  currency_code: string;
  observed_at: string;
  confidence_score: number;
  status: ManualReconciliationStatus;
  decision: ManualReconciliationDecision;
  decision_reason: string;
  provider_neutral: true;
  api_key_scope_consumed: false;
  provider_callback_processed: false;
  payment_allocation_performed: false;
  auto_reconciliation_performed: false;
  irreversible_action_allowed: false;
};
