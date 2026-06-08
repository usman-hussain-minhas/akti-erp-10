export const PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID = 'seed_6b_13_banking_evidence_export' as const;
export const PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID = '6B.13' as const;

export const BANKING_EVIDENCE_EXPORT_EVENT = 'phase_6b.banking_reconciliation.evidence_export.generated' as const;

export type BankingEvidenceArtifactType = 'BANK_ACCOUNT' | 'BANK_TRANSACTION' | 'MATCH_CANDIDATE' | 'RECONCILIATION_STATEMENT' | 'EXCEPTION_QUEUE_ITEM';

export type BankingEvidenceArtifactInput = {
  artifact_ref: string;
  artifact_type: BankingEvidenceArtifactType;
  source_model: 'Phase6BBankAccount' | 'Phase6BBankTransaction' | 'Phase6BReconciliationCandidate' | 'Phase6BReconciliationStatement';
  source_record_ref: string;
  evidence_ref: string;
  captured_at: string;
  amount_minor?: number;
  currency_code?: string;
};

export type BankingEvidenceExportInput = {
  organization_id: string;
  source_seed_id: typeof PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID;
  export_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  reconciliation_statement_ref?: string;
  artifacts: BankingEvidenceArtifactInput[];
  requested_by_user_id: string;
  requested_at: string;
  external_delivery_requested?: boolean;
  payment_allocation_requested?: boolean;
  journal_posting_requested?: boolean;
  statement_closure_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type BankingEvidenceExportReceipt = {
  seed_id: typeof PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID;
  component_id: typeof PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID;
  event_name: typeof BANKING_EVIDENCE_EXPORT_EVENT;
  organization_id: string;
  source_seed_id: typeof PHASE_6B_BANKING_EVIDENCE_EXPORT_SEED_ID;
  export_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  reconciliation_statement_ref?: string;
  artifact_count: number;
  artifact_type_counts: Record<BankingEvidenceArtifactType, number>;
  artifacts: BankingEvidenceArtifactInput[];
  export_evidence_ref: string;
  export_digest: string;
  external_delivery_performed: false;
  payment_allocation_performed: false;
  journal_posting_performed: false;
  statement_closed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  requested_at: string;
};
