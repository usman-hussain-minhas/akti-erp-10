export const PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID = 'seed_6b_13_bank_statement_import' as const;
export const PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID = '6B.13' as const;

export const BANK_STATEMENT_IMPORT_EVENT = 'phase_6b.banking_reconciliation.bank_tx.imported' as const;

export type BankStatementImportFormat = 'CSV' | 'OFX' | 'MT940' | 'MANUAL_UPLOAD';
export type BankTransactionDirection = 'INFLOW' | 'OUTFLOW';

export type BankStatementRowInput = {
  row_ref: string;
  external_transaction_ref: string;
  transaction_date: string;
  value_date?: string;
  description: string;
  debit_amount_minor?: number;
  credit_amount_minor?: number;
  balance_after_minor?: number;
  currency_code: string;
};

export type NormalizedBankTransaction = {
  row_ref: string;
  external_transaction_ref: string;
  transaction_date: string;
  value_date?: string;
  description: string;
  direction: BankTransactionDirection;
  amount_minor: number;
  balance_after_minor?: number;
  currency_code: string;
  bank_transaction_evidence_ref: string;
};

export type BankStatementImportInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID;
  statement_import_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  statement_source_label: string;
  import_format: BankStatementImportFormat;
  statement_period_start_at: string;
  statement_period_end_at: string;
  statement_rows: BankStatementRowInput[];
  imported_by_user_id: string;
  imported_at: string;
  provider_fetch_requested?: boolean;
  credential_handling_requested?: boolean;
  reconciliation_requested?: boolean;
  payment_allocation_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type BankStatementImportReceipt = {
  seed_id: typeof PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID;
  component_id: typeof PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID;
  event_name: typeof BANK_STATEMENT_IMPORT_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_bank_account_model: 'Phase6BBankAccount';
  phase_6b_bank_transaction_model: 'Phase6BBankTransaction';
  source_seed_id: typeof PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID;
  statement_import_ref: string;
  bank_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  statement_source_label: string;
  import_format: BankStatementImportFormat;
  statement_period_start_at: string;
  statement_period_end_at: string;
  normalized_transactions: NormalizedBankTransaction[];
  imported_transaction_count: number;
  total_inflow_minor: number;
  total_outflow_minor: number;
  provider_fetch_performed: false;
  credential_handling_performed: false;
  reconciliation_performed: false;
  payment_allocation_performed: false;
  provider_callback_processed: false;
  irreversible_action_allowed: false;
  statement_import_evidence_ref: string;
  statement_import_digest: string;
  imported_by_user_id: string;
  imported_at: string;
};
