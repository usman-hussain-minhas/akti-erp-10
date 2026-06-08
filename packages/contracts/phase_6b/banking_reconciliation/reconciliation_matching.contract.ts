export const PHASE_6B_RECONCILIATION_MATCHING_SEED_ID = 'seed_6b_13_reconciliation_matching' as const;
export const PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID = '6B.13' as const;

export const RECONCILIATION_MATCHING_EVENT = 'phase_6b.banking_reconciliation.match_candidates.generated' as const;

export type ReconciliationTransactionDirection = 'INFLOW' | 'OUTFLOW';
export type ReconciliationMatchStatus = 'AUTO_MATCH_CANDIDATE' | 'REVIEW_REQUIRED' | 'REJECTED';

export type ReconciliationBankTransactionInput = {
  bank_transaction_ref: string;
  external_transaction_ref: string;
  bank_statement_import_ref: string;
  transaction_date: string;
  description: string;
  direction: ReconciliationTransactionDirection;
  amount_minor: number;
  currency_code: string;
  bank_transaction_evidence_ref: string;
};

export type ReconciliationAllocationTargetInput = {
  allocation_balance_ref: string;
  payment_ref: string;
  invoice_ref?: string;
  receivable_ref?: string;
  expected_direction: ReconciliationTransactionDirection;
  expected_amount_minor: number;
  currency_code: string;
  expected_settlement_at: string;
  chart_account_ref: string;
  allocation_evidence_ref: string;
};

export type ReconciliationMatchCandidate = {
  candidate_ref: string;
  bank_transaction_ref: string;
  allocation_balance_ref: string;
  payment_ref: string;
  invoice_ref?: string;
  receivable_ref?: string;
  chart_account_ref: string;
  status: ReconciliationMatchStatus;
  score: number;
  score_reasons: string[];
  amount_delta_minor: number;
  date_delta_days: number;
  currency_code: string;
  candidate_evidence_ref: string;
};

export type ReconciliationMatchingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_RECONCILIATION_MATCHING_SEED_ID;
  match_run_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  bank_transactions: ReconciliationBankTransactionInput[];
  allocation_targets: ReconciliationAllocationTargetInput[];
  generated_by_user_id: string;
  generated_at: string;
  auto_match_threshold?: number;
  review_threshold?: number;
  payment_allocation_requested?: boolean;
  journal_posting_requested?: boolean;
  statement_closure_requested?: boolean;
  manual_reconciliation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ReconciliationMatchingReceipt = {
  seed_id: typeof PHASE_6B_RECONCILIATION_MATCHING_SEED_ID;
  component_id: typeof PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID;
  event_name: typeof RECONCILIATION_MATCHING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_reconciliation_candidate_model: 'Phase6BReconciliationCandidate';
  phase_6b_bank_transaction_model: 'Phase6BBankTransaction';
  source_seed_id: typeof PHASE_6B_RECONCILIATION_MATCHING_SEED_ID;
  match_run_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  candidate_count: number;
  auto_match_candidate_count: number;
  review_required_count: number;
  rejected_count: number;
  candidates: ReconciliationMatchCandidate[];
  payment_allocation_performed: false;
  journal_posting_performed: false;
  statement_closed: false;
  manual_reconciliation_performed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  reconciliation_matching_evidence_ref: string;
  reconciliation_matching_digest: string;
  generated_by_user_id: string;
  generated_at: string;
};
