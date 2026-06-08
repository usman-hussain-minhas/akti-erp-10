import { createHash } from 'node:crypto';

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

const IMPORT_FORMATS: readonly BankStatementImportFormat[] = ['CSV', 'OFX', 'MT940', 'MANUAL_UPLOAD'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for bank statement import.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for bank statement import.`);
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireTimestamp(value, field);
}

function requireSourceSeed(value: string): typeof PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_13_bank_statement_import.');
  }
  return PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID;
}

function requireImportFormat(value: BankStatementImportFormat): BankStatementImportFormat {
  if (!IMPORT_FORMATS.includes(value)) {
    throw new Error('import_format is not supported for bank statement import.');
  }
  return value;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for bank statement import.');
  }
  return currency;
}

function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for bank statement import.`);
  }
  return value;
}

function normalizeRow(row: BankStatementRowInput, statementImportRef: string): NormalizedBankTransaction {
  const debitAmountMinor = optionalNonNegativeInteger(row.debit_amount_minor, 'debit_amount_minor');
  const creditAmountMinor = optionalNonNegativeInteger(row.credit_amount_minor, 'credit_amount_minor');
  if ((debitAmountMinor === undefined && creditAmountMinor === undefined) || (debitAmountMinor !== undefined && creditAmountMinor !== undefined)) {
    throw new Error('each statement row must provide exactly one of debit_amount_minor or credit_amount_minor.');
  }
  const amountMinor = debitAmountMinor ?? creditAmountMinor!;
  if (amountMinor === 0) {
    throw new Error('statement row amount must be greater than 0 for bank statement import.');
  }
  const rowRef = requireNonEmpty(row.row_ref, 'statement_rows.row_ref');
  const externalTransactionRef = requireNonEmpty(row.external_transaction_ref, 'statement_rows.external_transaction_ref');
  return {
    row_ref: rowRef,
    external_transaction_ref: externalTransactionRef,
    transaction_date: requireTimestamp(row.transaction_date, 'statement_rows.transaction_date'),
    value_date: optionalTimestamp(row.value_date, 'statement_rows.value_date'),
    description: requireNonEmpty(row.description, 'statement_rows.description'),
    direction: creditAmountMinor !== undefined ? 'INFLOW' : 'OUTFLOW',
    amount_minor: amountMinor,
    balance_after_minor: optionalNonNegativeInteger(row.balance_after_minor, 'balance_after_minor'),
    currency_code: normalizeCurrency(row.currency_code),
    bank_transaction_evidence_ref: `bank_statement_import:${statementImportRef}:${rowRef}:${externalTransactionRef}`,
  };
}

function normalizeRows(rows: BankStatementRowInput[], statementImportRef: string): NormalizedBankTransaction[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('statement_rows must include at least one row for bank statement import.');
  }
  const normalized = rows.map((row) => normalizeRow(row, statementImportRef));
  for (const field of ['row_ref', 'external_transaction_ref'] as const) {
    const refs = normalized.map((row) => row[field]);
    if (new Set(refs).size !== refs.length) {
      throw new Error(`statement_rows must not repeat ${field} for bank statement import.`);
    }
  }
  return normalized;
}

function digestStatementImport(receiptWithoutDigest: Omit<BankStatementImportReceipt, 'statement_import_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function importBankStatement(input: BankStatementImportInput): BankStatementImportReceipt {
  if (input.provider_fetch_requested === true) {
    throw new Error('bank statement import must not fetch from external providers.');
  }
  if (input.credential_handling_requested === true) {
    throw new Error('bank statement import must not handle credentials.');
  }
  if (input.reconciliation_requested === true) {
    throw new Error('bank statement import must not perform reconciliation.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('bank statement import must not perform payment allocation math.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('bank statement import must not process provider callbacks.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('bank statement import must not perform irreversible actions.');
  }

  const statementImportRef = requireNonEmpty(input.statement_import_ref, 'statement_import_ref');
  const statementPeriodStartAt = requireTimestamp(input.statement_period_start_at, 'statement_period_start_at');
  const statementPeriodEndAt = requireTimestamp(input.statement_period_end_at, 'statement_period_end_at');
  if (Date.parse(statementPeriodEndAt) < Date.parse(statementPeriodStartAt)) {
    throw new Error('statement_period_end_at must not be earlier than statement_period_start_at.');
  }
  const normalizedTransactions = normalizeRows(input.statement_rows, statementImportRef);

  const receiptWithoutDigest: Omit<BankStatementImportReceipt, 'statement_import_digest'> = {
    seed_id: PHASE_6B_BANK_STATEMENT_IMPORT_SEED_ID,
    component_id: PHASE_6B_BANKING_RECONCILIATION_COMPONENT_ID,
    event_name: BANK_STATEMENT_IMPORT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_bank_account_model: 'Phase6BBankAccount',
    phase_6b_bank_transaction_model: 'Phase6BBankTransaction',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    statement_import_ref: statementImportRef,
    bank_account_ref: requireNonEmpty(input.bank_account_ref, 'bank_account_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    statement_source_label: requireNonEmpty(input.statement_source_label, 'statement_source_label'),
    import_format: requireImportFormat(input.import_format),
    statement_period_start_at: statementPeriodStartAt,
    statement_period_end_at: statementPeriodEndAt,
    normalized_transactions: normalizedTransactions,
    imported_transaction_count: normalizedTransactions.length,
    total_inflow_minor: normalizedTransactions.filter((row) => row.direction === 'INFLOW').reduce((total, row) => total + row.amount_minor, 0),
    total_outflow_minor: normalizedTransactions.filter((row) => row.direction === 'OUTFLOW').reduce((total, row) => total + row.amount_minor, 0),
    provider_fetch_performed: false,
    credential_handling_performed: false,
    reconciliation_performed: false,
    payment_allocation_performed: false,
    provider_callback_processed: false,
    irreversible_action_allowed: false,
    statement_import_evidence_ref: `bank_statement_import:${statementImportRef}:imported`,
    imported_by_user_id: requireNonEmpty(input.imported_by_user_id, 'imported_by_user_id'),
    imported_at: requireTimestamp(input.imported_at, 'imported_at'),
  };

  return {
    ...receiptWithoutDigest,
    statement_import_digest: digestStatementImport(receiptWithoutDigest),
  };
}
